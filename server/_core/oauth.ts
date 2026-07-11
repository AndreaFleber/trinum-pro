import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { createSessionToken } from "./auth";
import { ENV } from "./env";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

/**
 * `__Host-` prefix enforces: Secure flag, Path=/, no Domain attribute.
 * This prevents cookie injection from sibling subdomains (login CSRF hardening).
 */
const OAUTH_STATE_COOKIE = "__Host-oauth_state";

/**
 * Derive the canonical callback URL.
 * Priority: explicit APP_BASE_URL env var → x-forwarded headers → request host.
 * Accepting APP_BASE_URL lets operators lock the value in production so that
 * a manipulated Host header cannot redirect the OAuth code to an attacker's domain.
 */
function getCallbackUrl(req: Request): string {
  if (ENV.appBaseUrl) {
    return `${ENV.appBaseUrl.replace(/\/$/, "")}/api/auth/google/callback`;
  }
  const proto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0].trim()
    ?? req.protocol;
  const host = (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0].trim()
    ?? req.get("host")
    ?? "localhost";
  return `${proto}://${host}/api/auth/google/callback`;
}

export function registerOAuthRoutes(app: Express) {
  /** Dev-only: returns OAuth configuration so the redirect URI can be verified against Google Cloud Console. */
  if (!ENV.isProduction) {
    app.get("/api/auth/debug", (req: Request, res: Response) => {
      const redirectUri = getCallbackUrl(req);
      const clientIdHint = ENV.googleClientId
        ? `${ENV.googleClientId.slice(0, 12)}…`
        : "(not set)";
      res.json({
        redirectUri,
        clientIdHint,
        appBaseUrl: ENV.appBaseUrl || "(derived from request headers)",
        note: "Add the exact redirectUri above to the 'Authorized redirect URIs' in Google Cloud Console, and make sure your Google account is listed as a Test User if the app is in Testing mode.",
      });
    });
  }

  /** Step 1: redirect the browser to Google's consent screen. */
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (!ENV.googleClientId) {
      return res.status(500).send("Google OAuth is not configured (missing GOOGLE_CLIENT_ID).");
    }

    const redirectUri = getCallbackUrl(req);
    console.log("[OAuth] Starting flow. redirect_uri =", redirectUri);

    const nonce = crypto.randomUUID();
    const state = Buffer.from(JSON.stringify({ nonce })).toString("base64url");

    // State cookie used for CSRF protection
    res.cookie(OAUTH_STATE_COOKIE, nonce, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600_000, // 10 minutes
      path: "/",
    });

    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set("client_id", ENV.googleClientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("access_type", "online");

    res.redirect(url.toString());
  });

  /** Step 2: Google redirects here with ?code=&state= */
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const stateParam = typeof req.query.state === "string" ? req.query.state : null;

    if (!code || !stateParam) {
      return res.status(400).send("Missing code or state parameter.");
    }

    // CSRF guard: nonce in state must match the cookie we set in step 1.
    let stateNonce: string | undefined;
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, "base64url").toString());
      stateNonce = decoded.nonce;
    } catch {
      return res.status(400).send("Malformed state parameter.");
    }

    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    const expectedNonce = cookies[OAUTH_STATE_COOKIE];
    if (!stateNonce || stateNonce !== expectedNonce) {
      return res.status(403).send("Invalid OAuth state — possible CSRF attempt.");
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });

    try {
      // Exchange authorization code for access token
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: getCallbackUrl(req),
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        console.error("[OAuth] Token exchange failed:", tokenRes.status, errBody);
        // redirect_uri_mismatch means the URI sent here doesn't match Google Cloud Console
        if (errBody.includes("redirect_uri_mismatch")) {
          return res.status(500).send(
            `OAuth error: redirect_uri_mismatch. The redirect URI used was: ${getCallbackUrl(req)} — ` +
              "add this exact URI to the Authorized redirect URIs in Google Cloud Console."
          );
        }
        return res.status(500).send(`Token exchange failed (${tokenRes.status}): ${errBody}`);
      }

      const tokenData = (await tokenRes.json()) as { access_token: string };

      // Fetch user profile from Google
      const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        return res.status(500).send("Failed to fetch user info from Google.");
      }

      const userInfo = (await userInfoRes.json()) as {
        sub: string;
        name?: string;
        email?: string;
      };

      const { sub, name, email } = userInfo;
      if (!sub) return res.status(400).send("Google did not return a user identifier.");

      // Upsert user in database and create session
      await db.upsertUser({
        openId: sub,
        name: name ?? null,
        email: email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      const sessionToken = await createSessionToken(sub, name ?? "");
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Google callback failed:", error);
      res.status(500).send("Authentication failed. Please try again.");
    }
  });
}

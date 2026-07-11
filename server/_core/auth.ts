import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = {
  openId: string;
  name: string;
};

export type AuthenticatedUser = User;

function getSessionSecret(): Uint8Array {
  const secret = ENV.cookieSecret;
  if (!secret) {
    if (ENV.isProduction) {
      throw new Error("JWT_SECRET / SESSION_SECRET must be set in production");
    }
    // Development only — log a loud warning so it is never overlooked
    console.warn(
      "[Auth] WARNING: JWT_SECRET is not set. Using an insecure temporary secret. " +
        "Set JWT_SECRET or SESSION_SECRET before deploying."
    );
    return new TextEncoder().encode("__dev_only_insecure_secret__");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Create a signed JWT session token for the given Google sub and display name.
 */
export async function createSessionToken(openId: string, name: string): Promise<string> {
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);

  return new SignJWT({ openId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSessionSecret());
}

/**
 * Verify a session token and return its payload, or null if invalid/expired.
 */
export async function verifySession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });
    const { openId, name } = payload as Record<string, unknown>;
    if (typeof openId !== "string" || !openId) {
      console.warn("[Auth] Session payload missing openId");
      return null;
    }
    return { openId, name: typeof name === "string" ? name : "" };
  } catch {
    return null;
  }
}

/**
 * Extract and verify the session from an Express request (cookie or Bearer header),
 * then resolve the database user. Throws ForbiddenError on failure.
 */
export async function authenticateRequest(req: Request): Promise<AuthenticatedUser> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  let sessionToken: string | undefined = cookies[COOKIE_NAME];

  // Fallback: Authorization: Bearer <token> (for environments that block cookies)
  if (!sessionToken) {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      sessionToken = authHeader.slice(7);
    }
  }

  const session = await verifySession(sessionToken);
  if (!session) throw ForbiddenError("Invalid or missing session");

  const user = await db.getUserByOpenId(session.openId);
  if (!user) throw ForbiddenError("User not found");

  return user;
}

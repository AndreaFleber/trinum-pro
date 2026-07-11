---
name: Supabase + Google OAuth setup
description: Database is Supabase PostgreSQL (not Replit's managed DB); auth is Google OAuth replacing Manus platform OAuth.
---

## Database
- Env var: `SUPABASE_DATABASE_URL` (not `DATABASE_URL` — that is Replit-managed and must not be overridden)
- Driver: `postgres` (postgres-js) with `prepare: false` for Supabase's pgBouncer transaction pooler
- Drizzle dialect: `postgresql` (was `mysql`)
- Schema: `drizzle/schema.ts` uses `pg-core` — `serial`, `integer`, `pgEnum`, `pgTable`, `text`, `timestamp`, `varchar`

**Why:** `DATABASE_URL` is runtime-managed by Replit's own PostgreSQL; the user's Supabase URL must live under a different key.

## Auth
- Route: GET `/api/auth/google` → redirect to Google; GET `/api/auth/google/callback` → exchange code, set session cookie
- State cookie: `__Host-oauth_state` (`httpOnly`, `secure`, `path=/`, no `domain`) — `__Host-` prefix enforced by browser for CSRF hardening
- Session cookie: `app_session_id` — signed JWT (HS256) via `jose`, 1-year expiry
- JWT secret: `JWT_SECRET` env var, falls back to `SESSION_SECRET`; fails fast in production if missing
- Redirect URI: built from `APP_BASE_URL` env var if set, otherwise from request headers (fine for dev, must set for production deployment)

**Why:** Manus OAuth was tied to the Manus platform and required `OAUTH_SERVER_URL` + `VITE_APP_ID`. Google OAuth is fully independent.

## Key files
- `server/_core/auth.ts` — JWT create/verify, `authenticateRequest()`
- `server/_core/oauth.ts` — Google OAuth routes
- `server/_core/env.ts` — all env vars including `appBaseUrl`
- `server/db.ts` — `getDb()` uses postgres-js, `upsertUser` uses `onConflictDoUpdate`

## Deployment checklist
1. Set `APP_BASE_URL` secret to the deployed domain
2. Add `https://<domain>/api/auth/google/callback` to Google Cloud Console OAuth client authorized redirect URIs
3. Ensure `JWT_SECRET` or `SESSION_SECRET` is set (server refuses to start in production without it)

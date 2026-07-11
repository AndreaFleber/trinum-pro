# TRINUM Pro

A math puzzle game where players hit a numeric target using 3–4 random numbers and arithmetic operators. Features a global leaderboard, Easy/Hard difficulty modes, and score persistence.

## Stack

- **Frontend**: React 19, Vite 7, TailwindCSS 4, tRPC client, Wouter (routing), Radix UI components
- **Backend**: Express + tRPC server, tsx for dev, esbuild for prod build
- **Database**: PostgreSQL via [Supabase](https://supabase.com), Drizzle ORM (postgres-js driver)
- **Auth**: Google OAuth 2.0 — `/api/auth/google` → `/api/auth/google/callback`, JWT session cookie (`app_session_id`)
- **Package manager**: pnpm

## Running the app

```bash
pnpm dev       # development server on port 5000
pnpm build     # production build
pnpm start     # run production build
pnpm db:push   # generate + apply DB migrations (requires SUPABASE_DATABASE_URL)
pnpm test      # run unit tests (vitest)
```

The workflow `Start application` runs `PORT=5000 pnpm dev`.

## Environment secrets

| Secret | Purpose |
|---|---|
| `SUPABASE_DATABASE_URL` | Supabase PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `SESSION_SECRET` / `JWT_SECRET` | JWT signing secret (SESSION_SECRET is used as fallback) |

## Google OAuth redirect URI

When deploying, add the new domain to the authorised redirect URIs in Google Cloud Console:
```
https://<your-domain>/api/auth/google/callback
```

## Project structure

```
client/src/          React frontend
  pages/             Home, GameBoard, Leaderboard, HowToPlay, NotFound
  _core/hooks/       useAuth (session management)
  components/        UI components incl. ManusDialog (Google sign-in dialog)
server/
  _core/             Express bootstrap, auth, OAuth routes, tRPC setup
  routers.ts         tRPC router (auth + game endpoints)
  db.ts              Database queries (Drizzle + postgres-js)
drizzle/
  schema.ts          PostgreSQL schema (users, gameScores, userStats)
shared/              Types and constants shared between client and server
```

## User preferences

- Database: Supabase (PostgreSQL), not Replit's built-in DB
- Auth: Google OAuth (independent, no Manus platform dependency)
- Env var for DB: `SUPABASE_DATABASE_URL` (not `DATABASE_URL`, which is Replit-managed)

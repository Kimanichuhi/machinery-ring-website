# Machinery Ring Nyandarua

Farmer-owned service organization in Nyandarua, Kenya — website for browsing farm inputs, booking agricultural services, and accessing farming guides.

## Getting started

Requires Node.js (or Bun).

```sh
# Install dependencies
npm i
# or: bun install

# Copy the environment template and fill in your Supabase credentials
cp .env.example .env

# Start the dev server
npm run dev
# or: bun run dev
```

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (database, auth, storage)

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run test` — run tests
- `npm run security:check` — check for known security findings

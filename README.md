# Cartly

A full-stack e-commerce storefront — browse and search a real product catalog, sign up and log in, keep a cart that persists across devices, check out into a real order, and manage the catalog through an admin dashboard with image upload. Built with React, TypeScript, and Supabase (Postgres, Auth, Storage).

## Features

- **Catalog** — category filter, debounced search, sorting, price range and pagination, all executed in Postgres (not client-side array filtering).
- **Product pages** — shareable `/products/:slug`, photo gallery, real size/colour selection (options are recorded on the bag line and the order), related products. Product URLs are server-rendered with Open Graph / JSON-LD tags (`api/product-meta.ts`) so link previews work; `/sitemap.xml` and `robots.txt` are provided.
- **Bag** — one shared bag for the whole app: `localStorage` for guests, a `cart_items` table for signed-in users (optimistic updates), merged on login. Stock-aware; opens as a slide-over drawer from the header and after adding, with a full `/cart` page too.
- **Wishlist** — guests (`localStorage`) and signed-in users (`wishlist_items`), merged on login.
- **Auth** — email/password with confirmation, forgot/reset password, resend confirmation, role-based access (`customer` / `admin`).
- **Checkout & orders** — orders are placed by the `place_order` database function: totals come from real prices, stock is checked and decremented, options are validated, and everything is one transaction (clients cannot insert orders directly). Order history at `/account`. No payment gateway (demo).
- **Admin** (`/admin`, role-gated) — overview with low-stock list, product CRUD with multi-photo upload to Storage (files are removed when replaced or deleted), order management (guarded status transitions, cancelling restocks), category management, and a client error log.
- **Help pages** — shipping, returns, privacy and terms, written to describe what this demo store actually does.
- **Hardening** — DB-level rate limits and constraints on the contact/newsletter forms, honeypot fields, error reporting to `client_errors`, GitHub Actions CI (typecheck, tests, build).

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/), [React Router](https://reactrouter.com/) for routing
- [Supabase](https://supabase.com/) — Postgres (with row-level security), Auth, Storage
- [TanStack Query](https://tanstack.com/query) for server state (data fetching, caching, mutations)
- [Framer Motion](https://www.framer.com/motion/) for animations, [React Icons](https://react-icons.github.io/react-icons/) (Feather set) for iconography
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react) for tests

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project's URL + publishable key
npm run dev
```

Open the local URL Vite prints (defaults to [http://localhost:5173](http://localhost:5173)).

### Environment variables

| Variable | Where it's used | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Browser (Vite inlines it into the build) | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Safe to expose — access is enforced by RLS, not by keeping this secret |
| `SUPABASE_SECRET_KEY` | Local scripts only (`scripts/seed.ts`) | **Never** prefix this with `VITE_` — it bypasses RLS entirely |
| `CARTLY_DB_PASSWORD` | Local scripts only (`scripts/migrate.ts`) | Direct Postgres connection for running migrations |
| `CARTLY_DB_HOST` | Local scripts only (optional) | Session-pooler host; required on IPv4-only networks because the direct DB host is IPv6-only |

`.env.local` is gitignored and never reaches a deployed build. On a host like Vercel, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` must be added separately as that platform's environment variables (and the deploy re-run) — otherwise the app fails fast on startup rather than running with a broken client (see `src/lib/supabaseClient.ts`).

### Database setup

The schema lives in `supabase/migrations/`. Since this project doesn't use the Supabase CLI's Docker-dependent workflow, migrations run via a direct Postgres connection instead:

```bash
npm run db:migrate   # applies pending supabase/migrations/*.sql, tracked in schema_migrations
npm run images:build # normalizes assets/source-photos into public/images/{products,editorial}
npm run db:seed      # loads the curated demo catalog (scripts/catalog.ts); idempotent
```

To make your account an admin, sign up through `/signup`, confirm the email, then in the Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where id = '<your-auth-uid>';
```

### Other scripts

- `npm run build` — production bundle to `dist/`
- `npm run preview` — locally preview the production build
- `npm run typecheck` / `npm run typecheck:scripts` — type-check the app / the Node scripts
- `npm run test` / `npm run test:watch` — run the test suite once / in watch mode

## Project structure

```
src/
  App.tsx, main.tsx        # routes, providers, entry point
  context/                 # Auth, Cart, Wishlist, Toast, UI (filters) providers
  components/SiteLayout    # shared header/footer + animated page transitions
  hooks/                   # TanStack Query hooks — catalog, cart, orders, wishlist, admin mutations
  lib/                     # pure/utility modules: cart math, slugs, image URLs, Storage upload, Supabase client
  types/                   # generated-style Database type + hand-written domain aliases
  pages/                   # route components, including pages/admin/
  components/              # presentational + shared components
api/                        # Vercel functions: product meta tags (SEO), sitemap
assets/source-photos/       # original photos (not deployed) — input to images:build
scripts/
  catalog.ts                # single source of truth for the demo catalog
  optimize-images.ts        # builds uniform 4:5 product images + editorial crops (sharp)
  migrate.ts, seed.ts       # local-only: apply migrations / seed data
supabase/
  migrations/               # schema as SQL, applied in order
```

## Known limitations

- No payment gateway — checkout creates an order record only (by design).
- Size/colour are options on a product, and all sizes share one stock pool; a per-variant stock matrix would be the next step.
- No email notifications for orders or inquiries (would need an Edge Function or similar).
- Supabase Auth → URL Configuration must list the deployed site URL (and `/reset-password`) as allowed redirects, or password-reset and confirmation links fall back to the default Site URL.
- The default Open Graph tags in `index.html` hard-code the production origin (images must be absolute); update it if the domain changes.
- Error monitoring is a small built-in log, not a hosted tracker.

## License

Personal/portfolio project.

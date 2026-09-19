# Cartly

A full-stack e-commerce storefront — browse and search a real product catalog, sign up and log in, keep a cart that persists across devices, check out into a real order, and manage the catalog through an admin dashboard with image upload. Built with React, TypeScript, and Supabase (Postgres, Auth, Storage).

## Features

- **Product catalog** — category filtering and live search, backed by real Supabase queries (not client-side array filtering).
- **Product detail pages** — shareable `/products/:slug` routes.
- **Wishlist** — works for guests (`localStorage`) and signed-in users (`wishlist_items`), merged on login; dedicated `/wishlist` page.
- **Auth** — email/password sign up and login via Supabase Auth, with email confirmation and role-based access (`customer` / `admin`).
- **Cart** — one shared bag for the whole app: `localStorage` for guests, a `cart_items` table for signed-in users (optimistic updates), merged automatically on login. Stock-aware (never exceeds available units).
- **Checkout & orders** — turns the cart into a real order (`orders` + `order_items`, price/name snapshotted at purchase time); order history at `/account`. Order placement only — no payment gateway is integrated.
- **Admin dashboard** (`/admin`, role-gated) — create, edit, and delete products, with real image upload to Supabase Storage.
- **Contact form & newsletter signup** — write to real `inquiries` / `newsletter_subscribers` tables.

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
  hooks/                   # TanStack Query hooks — products, cart, orders, wishlist, admin mutations
  lib/                     # pure/utility modules: cart math, slugs, image URLs, Storage upload, Supabase client
  types/                   # generated-style Database type + hand-written domain aliases
  pages/                   # route components, including pages/admin/
  components/              # presentational + shared components
scripts/
  catalog.ts                # single source of truth for the demo catalog
  optimize-images.ts        # builds uniform 4:5 product images + editorial crops (sharp)
  migrate.ts, seed.ts       # local-only: apply migrations / seed data
supabase/
  migrations/               # schema as SQL, applied in order
```

## Known limitations

- No payment gateway — checkout creates an order record only (by design, not yet implemented).
- No product variants (a product has one size/color, not a matrix of stocked combinations).
- No email notifications for orders, inquiries, or newsletter signups (the tables exist; sending mail would need a Supabase Edge Function or similar).

## License

Personal/portfolio project.

# Cartly

A responsive e-commerce storefront UI built with React — browse products by category, live-search the catalog, add items to a running cart with total pricing, and manage listings through an animated add/edit product form.

> **Status:** actively being rebuilt. The build tooling has moved from Create React App to Vite; a Supabase-backed product catalog and real authentication are next, replacing the in-memory Context state described below. See [Roadmap](#roadmap).

## Features

- **Product catalog** — grid of items (clothing, shoes, women's wear, handbags) with image, name, price, size, color, and country of origin.
- **Category filtering** — a sticky category bar (`all`, `men`, `shoe`, `women`, `handbag`) to narrow the catalog instantly.
- **Live search** — filter products by name as you type.
- **Like/favorite toggle** — mark items on the fly.
- **Item detail modal** — click an item for a closer look at its details.
- **Shopping cart** — an animated, swipeable cart drawer that lists added items and keeps a running total; items can be removed individually.
- **Add item form** — an animated modal for appending new products to the catalog (name, price, size, color, category, origin, image).
- **Edit item form** — scaffolded for updating existing catalog entries.
- Global state managed with React's **Context API** — the entire catalog and cart currently live in memory (no backend yet — see Roadmap).

## Tech stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) for tooling, [React Router](https://reactrouter.com/) for routing
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Swiper](https://swiperjs.com/) for carousels (hero banner, category bar, cart drawer)
- [React Icons](https://react-icons.github.io/react-icons/) for iconography

## Getting started

```bash
npm install
npm run dev
```

Open the local URL Vite prints (defaults to [http://localhost:5173](http://localhost:5173)) to view it in the browser. The page reloads automatically as you edit source files.

Other available scripts:

- `npm run build` — build a production bundle to `dist/`
- `npm run preview` — locally preview the production build

## Project structure

```
src/
  Context.jsx        # global state: catalog, cart, filters, search, modals
  App.jsx             # routes (Home, Login)
  main.jsx            # entry point
  pages/
    Home.jsx          # main storefront layout
    Login.jsx          # placeholder, not yet implemented
    Admin.jsx          # placeholder, not yet implemented
  components/
    Header.jsx, StickyHeader.jsx   # nav, search entry, cart/add triggers
    Items.jsx, Item.jsx            # catalog grid and card
    Categories.jsx, PopularCategory.jsx
    SearchItems.jsx
    Cart.jsx
    AddForm.jsx, EditForm.jsx
    MoreInfoModal.jsx
    Contact.jsx, Footer.jsx
```

## Known limitations

This is a front-end concept/demo being actively rebuilt into a real app, not yet production-ready:

- All product data is hardcoded in [`Context.jsx`](src/Context.jsx) — there is no real backend or database yet.
- `Login` and `Admin` pages are unstyled placeholders.
- No persistence — cart and catalog edits reset on page reload.
- No checkout/payment integration.

## Roadmap

The app is being rebuilt in phases:

- [x] Migrate build tooling from Create React App to Vite
- [ ] **Foundation** — Supabase-backed product catalog and database, real authentication (working `Login`), category/search wired to real data; cart stays client-side but is architected to move server-side later
- [ ] **Admin CRUD** — database-backed add/edit/delete for products, with real image upload
- [ ] **Checkout** — checkout flow and order history

## License

Personal/portfolio project.

# Shopper

A responsive e-commerce storefront UI built with React — browse products by category, live-search the catalog, add items to a running cart with total pricing, and manage listings through an animated add/edit product form, all powered by the Context API (no backend required).

## Features

- **Product catalog** — grid of items (clothing, shoes, women's wear, handbags) with image, name, price, size, color, and country of origin.
- **Category filtering** — a sticky category bar (`all`, `men`, `shoe`, `women`, `handbag`) to narrow the catalog instantly.
- **Live search** — filter products by name as you type.
- **Like/favorite toggle** — mark items on the fly.
- **Item detail modal** — click an item for a closer look at its details.
- **Shopping cart** — an animated, swipeable cart drawer that lists added items and keeps a running total; items can be removed individually.
- **Add item form** — an animated modal for appending new products to the catalog (name, price, size, color, category, origin, image).
- **Edit item form** — scaffolded for updating existing catalog entries.
- Global state managed with React's **Context API** — the entire catalog and cart live in memory, no server required.

## Tech stack

- [React 18](https://react.dev/) (bootstrapped with Create React App) + [React Router](https://reactrouter.com/) for routing
- [Framer Motion](https://www.framer.com/motion/) and [AOS](https://michalsnik.github.io/aos/) for animations
- [Swiper](https://swiperjs.com/) for the cart carousel
- [React Icons](https://react-icons.github.io/react-icons/) for iconography
- [SweetAlert2](https://sweetalert2.github.io/) for alerts

## Getting started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page reloads automatically as you edit source files.

Other available scripts:

- `npm test` — run the test runner in watch mode
- `npm run build` — build a production bundle to `build/`

## Project structure

```
src/
  Context.jsx        # global state: catalog, cart, filters, search, modals
  App.js             # routes (Home, Login)
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

This is a front-end concept/demo, not a production-ready store:

- All product data is hardcoded in [`Context.jsx`](src/Context.jsx) — there is no real backend or database, and the `json-server` dependency is currently unused.
- `Login` and `Admin` pages are unstyled placeholders.
- No persistence — cart and catalog edits reset on page reload.
- No checkout/payment integration.

## Roadmap

Future iterations are planned to rebuild this into a more complete application, potentially including:

- A real backend/API and persistent database for products, users, and orders
- Working authentication (`Login`) and a functional `Admin` dashboard for product management
- Checkout flow with order history
- Image uploads instead of manual filename entry

## License

Personal/portfolio project.

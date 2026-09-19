export interface LegalSection {
  heading: string;
  body: string[]; // paragraphs
}

export interface LegalDoc {
  slug: 'shipping' | 'returns' | 'privacy' | 'terms';
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

/**
 * These pages describe how Cartly actually behaves today. Cartly is a
 * demonstration storefront: it records orders but takes no payment and ships
 * nothing, so the copy says so instead of promising delivery times or refund
 * windows that don't exist. A real merchant would replace the operational
 * details (carriers, timeframes, legal entity) before launch.
 */
export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'shipping',
    title: 'Shipping',
    intro: 'How an order moves from your bag to fulfilled — and what to expect from this demo store.',
    updated: '19 September 2026',
    sections: [
      {
        heading: 'This is a demonstration store',
        body: [
          'Cartly is a portfolio project. Orders are recorded in a real database so the full checkout and order-management flow can be demonstrated, but no payment is taken and no parcels are dispatched.',
        ],
      },
      {
        heading: 'What we ask for at checkout',
        body: [
          'To place an order you provide a name, a delivery address and a phone number. These are stored with the order so the person managing it can see where it would be sent.',
        ],
      },
      {
        heading: 'Order status',
        body: [
          'Every order starts as Pending. A store administrator can move it to Confirmed and then Fulfilled, or cancel it. You can follow the current status of your orders at any time under My orders.',
          'Shipping costs and delivery estimates are not calculated in this demo — the total you see at checkout is the sum of the items in your bag.',
        ],
      },
      {
        heading: 'Stock',
        body: [
          'Stock is reserved at the moment you place an order. If an item sells out while it is in your bag, checkout will tell you which item is no longer available in the quantity you asked for.',
        ],
      },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns & cancellations',
    intro: 'What happens if you change your mind about an order in this demo store.',
    updated: '19 September 2026',
    sections: [
      {
        heading: 'No payment, no refunds',
        body: [
          'Because Cartly takes no payment, there is nothing to refund. Orders are records only.',
        ],
      },
      {
        heading: 'Cancelling an order',
        body: [
          'A store administrator can cancel an order that is Pending or Confirmed. Cancelling returns the items to stock and the order is marked Cancelled in your order history. Fulfilled and cancelled orders cannot be changed further.',
          'To ask for a cancellation, use the contact form and quote your order number (shown under My orders).',
        ],
      },
      {
        heading: 'If this were a live store',
        body: [
          'A merchant launching Cartly would define its own return window, condition requirements and refund method here, in line with the consumer-protection rules of the countries it sells to.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy',
    intro: 'What this site stores about you, why, and how to have it removed.',
    updated: '19 September 2026',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'Account: your email address, the name you give at sign-up and a password (stored only as a hash by our authentication provider — we never see it).',
          'Orders: the name, delivery address and phone number you enter at checkout, plus the items and prices of each order.',
          'Bag and wishlist: the items you add. While you are signed out these are kept only in your browser; when you sign in they are saved to your account.',
          'Messages: anything you send through the contact form, and your email address if you join the newsletter.',
        ],
      },
      {
        heading: 'Where it is stored',
        body: [
          'Data is stored in a Supabase (Postgres) project. Row-level security means signed-in customers can read only their own carts, wishlists and orders; store administrators can see orders in order to manage them.',
        ],
      },
      {
        heading: 'Cookies and tracking',
        body: [
          'We do not use advertising or analytics trackers. Your browser’s local storage holds your sign-in session and, when signed out, your bag and wishlist so they survive a page refresh.',
        ],
      },
      {
        heading: 'Your choices',
        body: [
          'You can ask to see, correct or delete the data held about you by using the contact form. Deleting an account removes its profile, bag, wishlist and orders.',
          'You can leave the newsletter at any time by asking us to remove your address.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of use',
    intro: 'The ground rules for using this demonstration store.',
    updated: '19 September 2026',
    sections: [
      {
        heading: 'A demonstration, not a shop',
        body: [
          'Cartly is a portfolio project. Products, prices and images are illustrative, orders are not fulfilled and no payment is taken. Nothing here is an offer to sell.',
        ],
      },
      {
        heading: 'Your account',
        body: [
          'Keep your password private and use accurate details when you register. Please do not enter sensitive personal information — this is a demo and you should treat it as one.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'Please do not attempt to disrupt the site, access other people’s data, or submit automated or abusive content through the forms. Accounts or messages that do may be removed.',
        ],
      },
      {
        heading: 'Availability and changes',
        body: [
          'The site and its data may be changed, reset or taken offline at any time without notice. We may update these terms as the project evolves; the date at the top of each page shows when it last changed.',
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}

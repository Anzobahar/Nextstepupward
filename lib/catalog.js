/**
 * Server-side product catalog — the single source of truth for prices.
 *
 * The browser NEVER sends an amount. It sends only an `id`, and the server
 * looks the price up here. This prevents a customer from tampering with the
 * price before checkout.
 *
 * Two ways to price an item:
 *   1. Inline `amount` (in cents) + `currency` — works out of the box, no
 *      Stripe dashboard setup needed. Good for getting started.
 *   2. A Stripe `priceId` (recommended for production) — create Products/Prices
 *      in the Stripe dashboard and paste the `price_...` id into the matching
 *      env var. If a priceId is set it takes precedence over `amount`.
 *
 * `mode`: "payment" for one-off purchases, "subscription" for recurring plans.
 *
 * Shared by both the Vercel functions in /api and the local Express server.
 */

export const CATALOG = {
  // ---- Coaching ----
  single: {
    name: "Single coaching session",
    description: "One 50-minute 1-on-1 video session with a specialist coach.",
    mode: "payment",
    amount: 5900, // €59.00
    currency: "eur",
    priceId: process.env.PRICE_SINGLE || null,
  },
  package5: {
    name: "5-session coaching package",
    description: "Five 1-on-1 sessions with the same coach, plus habit tracking.",
    mode: "payment",
    amount: 24900, // €249.00
    currency: "eur",
    priceId: process.env.PRICE_PACKAGE5 || null,
  },
  membership: {
    name: "Membership",
    description: "2 live sessions per month, full course library, group sessions.",
    mode: "subscription",
    amount: 9900, // €99.00 / month
    currency: "eur",
    interval: "month",
    priceId: process.env.PRICE_MEMBERSHIP || null,
  },

  // ---- Courses (buy a course) ----
  "course-sleep": {
    name: "Sleep Reset — self-paced course",
    description: "A 4-week guided course to fall asleep faster and wake up rested.",
    mode: "payment",
    amount: 4900, // €49.00
    currency: "eur",
    priceId: process.env.PRICE_COURSE_SLEEP || null,
  },
  "course-focus": {
    name: "Deep Focus & Productivity — self-paced course",
    description: "Build a focus system and habits that make deep work automatic.",
    mode: "payment",
    amount: 5900, // €59.00
    currency: "eur",
    priceId: process.env.PRICE_COURSE_FOCUS || null,
  },
  "course-stress": {
    name: "Calm Under Pressure — self-paced course",
    description: "Practical tools to lower stress and protect your energy.",
    mode: "payment",
    amount: 3900, // €39.00
    currency: "eur",
    priceId: process.env.PRICE_COURSE_STRESS || null,
  },
};

/** Build a Stripe line item for a catalog entry (uses priceId if present). */
export function toLineItem(item) {
  if (item.priceId) {
    return { price: item.priceId, quantity: 1 };
  }
  const price_data = {
    currency: item.currency,
    unit_amount: item.amount,
    product_data: {
      name: item.name,
      description: item.description,
    },
  };
  if (item.mode === "subscription") {
    price_data.recurring = { interval: item.interval || "month" };
  }
  return { price_data, quantity: 1 };
}

/** Public, secret-free view of the catalog for the front-end. */
export function publicCatalog() {
  const pub = {};
  for (const [id, item] of Object.entries(CATALOG)) {
    pub[id] = {
      name: item.name,
      description: item.description,
      mode: item.mode,
      amount: item.amount,
      currency: item.currency,
      interval: item.interval || null,
    };
  }
  return pub;
}

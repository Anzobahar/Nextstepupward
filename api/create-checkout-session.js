// Vercel serverless function — POST /api/create-checkout-session
// Body: { id }  ->  { url }   (the Stripe hosted checkout URL to redirect to)
import Stripe from "stripe";
import { CATALOG, toLineItem } from "../lib/catalog.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.body || {};
    const item = CATALOG[id];
    if (!item) {
      return res.status(400).json({ error: "Unknown product." });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return res
        .status(503)
        .json({ error: "Payments are not configured yet. Add STRIPE_SECRET_KEY in Vercel." });
    }

    // Absolute origin for success/cancel URLs — custom domain or the Vercel URL.
    const origin =
      process.env.SITE_URL ||
      `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: item.mode,
      line_items: [toLineItem(item)],
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel.html`,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      metadata: { itemId: id },
      ...(item.mode === "payment"
        ? { payment_intent_data: { metadata: { itemId: id } } }
        : { subscription_data: { metadata: { itemId: id } } }),
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err.message);
    return res.status(500).json({ error: "Could not start checkout. Please try again." });
  }
}

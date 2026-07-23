/**
 * Local / self-hosted server (Express) — an alternative to Vercel.
 *
 * On Vercel you don't run this: the /api/*.js functions handle checkout and
 * the static files are served automatically. This file is for running the
 * whole thing locally (`npm run dev`) or on a VPS (Render, Railway, Fly, …).
 *
 * It reuses the SAME catalog as the Vercel functions (../lib/catalog.js) and
 * serves the static site so http://localhost:3000 has working checkout.
 */

import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import Stripe from "stripe";
import { CATALOG, toLineItem, publicCatalog } from "../lib/catalog.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.join(__dirname, "..");

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  SITE_URL = "http://localhost:3000",
  ALLOWED_ORIGIN,
  PORT = 3000,
} = process.env;

if (!STRIPE_SECRET_KEY) {
  console.warn(
    "\n⚠️  STRIPE_SECRET_KEY is not set. Copy .env.example to .env and add your " +
      "Stripe test key before taking payments.\n"
  );
}

const stripe = new Stripe(STRIPE_SECRET_KEY || "sk_test_placeholder");
const app = express();
app.set("trust proxy", 1);

/* Webhook FIRST — needs the raw body, before express.json() runs. */
app.post("/api/webhook", express.raw({ type: "application/json" }), (req, res) => {
  let event = req.body;
  if (STRIPE_WEBHOOK_SECRET) {
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("⚠️  Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    try { event = JSON.parse(req.body.toString("utf8")); } catch { /* keep buffer */ }
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    console.log(
      `✅ Payment complete: ${s.metadata?.itemId || "unknown"} ` +
        `(${s.customer_details?.email || "no email"}) — ${s.id}`
    );
    // TODO: fulfil the order here.
  }
  res.json({ received: true });
});

/* CORS — only needed if the front-end lives on a different origin. */
if (ALLOWED_ORIGIN) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
}

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/catalog", (_req, res) => res.json(publicCatalog()));

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { id } = req.body || {};
    const item = CATALOG[id];
    if (!item) return res.status(400).json({ error: "Unknown product." });
    if (!STRIPE_SECRET_KEY) {
      return res.status(503).json({ error: "Payments are not configured yet. Add STRIPE_SECRET_KEY." });
    }
    const session = await stripe.checkout.sessions.create({
      mode: item.mode,
      line_items: [toLineItem(item)],
      success_url: `${SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/cancel.html`,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      metadata: { itemId: id },
      ...(item.mode === "payment"
        ? { payment_intent_data: { metadata: { itemId: id } } }
        : { subscription_data: { metadata: { itemId: id } } }),
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err.message);
    res.status(500).json({ error: "Could not start checkout. Please try again." });
  }
});

app.use(express.static(siteRoot, { extensions: ["html"] }));

app.listen(PORT, () => {
  console.log(`\n▶  NextStepUpward running at ${SITE_URL}`);
  console.log(`   Stripe: ${STRIPE_SECRET_KEY ? "configured ✅" : "NOT configured ⚠️"}`);
  console.log(`   Webhook signature check: ${STRIPE_WEBHOOK_SECRET ? "on ✅" : "off (dev)"}\n`);
});

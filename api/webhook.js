// Vercel serverless function — POST /api/webhook  (Stripe webhook)
// Verifies the signature and fulfils orders. Needs the RAW body, so the
// automatic body parser is disabled below.
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method not allowed");
  }

  let event;
  try {
    const raw = await readRawBody(req);
    if (WEBHOOK_SECRET) {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(raw, sig, WEBHOOK_SECRET);
    } else {
      // Dev fallback with no signature check — set STRIPE_WEBHOOK_SECRET in prod.
      event = JSON.parse(raw.toString("utf8"));
    }
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // TODO: fulfil the order — grant course access, create the booking,
      // send a receipt, etc. session.metadata.itemId says what was bought.
      console.log(
        `✅ Payment complete: ${session.metadata?.itemId || "unknown"} ` +
          `(${session.customer_details?.email || "no email"}) — ${session.id}`
      );
      break;
    }
    case "invoice.paid":
      // Recurring membership payment succeeded.
      break;
    case "invoice.payment_failed":
      // Recurring membership payment failed — notify the customer.
      break;
    default:
      break;
  }

  return res.status(200).json({ received: true });
}

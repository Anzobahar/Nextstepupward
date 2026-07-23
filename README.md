# NextStepUpward B.V. — Website + Stripe Checkout

Marketing website and payments for **NextStepUpward B.V.**, a Dutch company
offering non-medical online coaching and mentoring: personal development,
stress & time management, sleep and habit improvement, and productivity.
Also trading as **RiseClarity** and **EaseMentor**.

Static, dependency-free **multipage** front-end + **Stripe Checkout** via
serverless functions (Vercel) or a local Express server.

## Structure

```
.
├── index.html            # Home
├── services.html         # Services
├── how-it-works.html     # How it works
├── pricing.html          # Pricing (Stripe checkout buttons)
├── courses.html          # Buy a course (Stripe checkout buttons)
├── about.html            # About
├── contact.html          # Contact form
├── faq.html              # FAQ
├── success.html          # Post-payment success (Stripe redirect target)
├── cancel.html           # Checkout cancelled
├── privacy-policy.html · terms.html · refund-policy.html   # Legal
├── assets/
│   ├── css/styles.css    # Design system + all page styles (fully responsive)
│   ├── js/main.js        # Nav, scroll reveal, contact form
│   ├── js/checkout.js    # Stripe checkout trigger (data-checkout buttons)
│   └── img/favicon.svg
├── lib/catalog.js        # Server-side price catalog (single source of truth)
├── api/                  # Vercel serverless functions
│   ├── create-checkout-session.js   # POST -> Stripe Checkout Session
│   ├── webhook.js                   # Stripe webhook (fulfilment)
│   └── catalog.js                   # GET public catalog
├── server/server.js      # Local/self-hosted Express server (same catalog)
├── vercel.json           # Vercel config
├── package.json          # ESM, deps: stripe (+ express/dotenv for local)
└── .env.example          # Env vars for local dev / Vercel
```

## How payments work

1. A buy button (`data-checkout data-item="single"`) posts the **item id** to
   `/api/create-checkout-session`.
2. The server looks the price up in `lib/catalog.js` (the browser never sends a
   price — no tampering) and creates a **Stripe Checkout Session**.
3. The browser is redirected to Stripe's hosted checkout.
4. On success Stripe redirects to `/success.html`; the `/api/webhook` endpoint
   receives `checkout.session.completed` to fulfil the order.

Products: `single`, `package5`, `membership` (subscription), `course-sleep`,
`course-focus`, `course-stress`. Edit prices/items in `lib/catalog.js`.

## Deploy to Vercel (recommended)

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new). No build
   command needed — it's zero-config (static files + `/api` functions).
2. **Project → Settings → Environment Variables**, add:
   - `STRIPE_SECRET_KEY` = `sk_live_...` (or `sk_test_...` to test)
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from the webhook you add in step 4)
   - `SITE_URL` = `https://nextstepupward.com` (your final domain)
3. Deploy. Your site is live at the Vercel URL and checkout works immediately
   (test mode) once `STRIPE_SECRET_KEY` is set.
4. **Stripe webhook:** in the Stripe dashboard → Developers → Webhooks, add an
   endpoint `https://<your-domain>/api/webhook` for events
   `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`.
   Copy the signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.
5. **Custom domain:** add `nextstepupward.com` in Vercel → Domains and point DNS
   there. (If the domain is on Cloudflare and showing a **522**, that's just
   Cloudflare with no working origin yet — set the DNS record to Vercel, or set
   the Cloudflare record to *DNS only* until it resolves, and the 522 clears.)

## Run locally

```bash
cp .env.example .env        # add your Stripe TEST key
npm install
npm run dev                 # http://localhost:3000 — static site + working checkout
```

Local Stripe webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhook
# paste the printed whsec_... into .env as STRIPE_WEBHOOK_SECRET
```

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

## Before launch

- Replace placeholder **prices** and **testimonials**, and add the company
  **KvK number + registered address** to the footer/legal pages.
- Use pre-created Stripe **Price IDs** for production (set `PRICE_*` env vars) so
  prices live in Stripe, not code.
- Wire **scheduling** (Cal.com / Calendly) for booking after purchase.
- Point the **contact form** (`assets/js/main.js`) at a real backend/CRM.
- Review legal pages (GDPR, refunds, terms) with a professional.

## Contact

ceo@nextstepupward.com

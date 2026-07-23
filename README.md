# NextStepUpward B.V. — Website

Marketing website for **NextStepUpward B.V.**, a Dutch company offering non-medical
online coaching and mentoring: personal development, stress & time management,
sleep and habit improvement, and productivity.

Also trading as **RiseClarity** and **EaseMentor**.

## Stack

Plain, dependency-free **static HTML/CSS/JS** — no build step, fast to host anywhere
(GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any static host).

```
.
├── index.html            # Landing page (hero, services, how-it-works, pricing, FAQ, contact)
├── privacy-policy.html   # GDPR privacy policy
├── refund-policy.html    # Refund & cancellation policy
├── terms.html            # Terms of service
└── assets/
    ├── css/styles.css    # Design system + all page styles
    ├── js/main.js        # Nav, scroll reveal, form handling
    └── img/favicon.svg   # Brand mark
```

## Run locally

No tooling required — just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy to GitHub Pages

1. Push to the `main` branch of this repo.
2. In **Settings → Pages**, set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. (Optional) Add a custom domain in the `CNAME` file and in Pages settings.

## Going live — what to wire up next

The site is presentation-ready. To turn it into a working product, connect:

- **Checkout** — replace the "Book / Choose" buttons (`#pricing`) with Stripe / Mollie
  Payment Links or Checkout Sessions.
- **Scheduling** — link the booking flow to Calendly, Cal.com, or your own scheduler.
- **Contact form** — `#contact-form` is a front-end demo. Point it at a form backend
  (Formspree, Netlify Forms) or your own endpoint / CRM. See `assets/js/main.js`.
- **Analytics** — add a privacy-friendly analytics snippet if desired.

## Content & compliance notes

- Services are positioned as **non-medical** coaching throughout (no therapy/medical claims).
- Legal pages cover GDPR, refunds/cancellations, and terms — review with a professional
  before launch and confirm company registration details (KvK number, registered address).
- Placeholder prices (€59 / €249 / €99) and testimonials are examples — update before launch.

## Contact

ceo@nextstepupward.com

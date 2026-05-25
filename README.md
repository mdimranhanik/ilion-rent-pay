# Stripe Rent Payment Link

A single shared link that any tenant can open, type in **their own rent amount**, and pay by card. The property owner gets notified via email on every successful payment.

---

## What this is

Instead of creating a separate invoice for every tenant, you share **one link** with everyone. When a tenant opens it, they:

1. Type the amount they owe
2. Enter their full name and unit/property address
3. Pay by card via Stripe's secure checkout

You'll see every payment — with the tenant's name and unit — in your Stripe dashboard. No app to build, no account for tenants to create.

---

## One-time setup

### 1. Create a Stripe account (if you haven't already)

Go to [stripe.com](https://stripe.com) and sign up. This is **your** account — the money lands here, taxes are yours, payouts go to your bank.

### 2. Get your Stripe secret key

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API keys**
3. Copy the **Secret key** (starts with `sk_test_...` for test mode)

> ⚠️ Keep this key private. Don't share it or put it in code.

### 3. Deploy to Vercel

**Option A — GitHub (recommended):**
1. Push this folder to a GitHub repo (your account or the client's)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Click **Deploy** — Vercel auto-detects the serverless function

**Option B — Vercel CLI:**
```bash
npm install -g vercel
cd stripe-rent-link
vercel
```

### 4. Add environment variables in Vercel

In your Vercel project: **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` (your key from step 2) |
| `SUCCESS_URL` | URL to show after payment (e.g. `https://yoursite.com/thank-you`) |
| `CANCEL_URL` | URL to show on cancel (e.g. `https://yoursite.com`) |
| `CURRENCY` | `usd` (or `aud`, `gbp`, etc.) — optional, defaults to `usd` |

After saving, **redeploy** the project so the variables take effect.

### 5. Your payment link is live

Share this URL with tenants:

```
https://<your-project>.vercel.app/pay
```

(Or `/api/pay` — both work.)

---

## Turn on email notifications (manual step — not in code)

Stripe doesn't email you automatically. You need to enable it once:

1. Stripe Dashboard → click your **profile icon** (top right) → **Profile**
2. Scroll to **Notifications**
3. Under **Successful payments**, enable **Email**

After this, Stripe emails the account owner every time a payment goes through.

---

## Testing

Use Stripe's test mode with these fake card details:

| Field | Value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g. `12/34`) |
| CVC | Any 3 digits |
| ZIP | Any 5 digits |

No real money moves in test mode.

---

## Going live

1. In Stripe Dashboard, click **Activate your account** and complete verification
2. Go to **Developers → API keys** → copy your **live** secret key (`sk_live_...`)
3. In Vercel, update the `STRIPE_SECRET_KEY` environment variable to the live key
4. Redeploy the project
5. Do one real test payment (you can refund it immediately from the Stripe dashboard)

---

## Hand-off checklist

Before the developer walks away, confirm all of these:

- [ ] **Stripe account is the CLIENT'S** — not the developer's. Money, tax, and payouts are the client's responsibility.
- [ ] **Vercel project is under the CLIENT'S Vercel login** — the client can redeploy, change env vars, and manage the domain.
- [ ] **All environment variables hold the CLIENT'S Stripe keys** — no developer keys anywhere.
- [ ] **Email notification is enabled** on the client's Stripe dashboard (see above).
- [ ] **Client has access to this repo** — they can redeploy if needed.
- [ ] **Developer's keys appear NOWHERE** in the repo, Vercel, or any config file.

---

## Future add-on: Automated post-payment actions (not yet implemented)

> This section is for when the client wants more than the built-in Stripe email — for example:
> - Log each payment to a Google Sheet automatically
> - Send a custom branded confirmation email to the tenant
> - Update a CRM or property management system
>
> **How it would work:**
> Add a Stripe **webhook** listening for the `checkout.session.completed` event,
> handled by a **[Trigger.dev](https://trigger.dev)** background task. Trigger.dev
> is a serverless job runner that connects to Stripe webhooks and can call Google
> Sheets API, send emails via Resend/SendGrid, or hit any other API.
>
> **To implement:** provide the Trigger.dev project credentials and the desired
> actions (which sheet, which email template, which CRM), and a `trigger/` folder
> will be added to this project alongside the existing `api/pay.js`.
>
> **Nothing here is built yet** — this note is just so you know it's possible
> without rebuilding from scratch.

---

## Project structure

```
stripe-rent-link/
├── api/
│   └── pay.js          ← the serverless function (the shared link)
├── package.json
├── vercel.json         ← routes /pay → /api/pay
├── .env.example        ← documents required env vars (no real keys)
├── .gitignore
└── README.md           ← this file
```

---

## Troubleshooting

**"Something went wrong" on the payment page**
→ Check Vercel function logs (Vercel dashboard → your project → **Functions** tab). Most likely the `STRIPE_SECRET_KEY` env var is missing or wrong.

**Amount field doesn't appear / Stripe shows a fixed price**
→ Make sure you're not using a saved Stripe Price. The `custom_unit_amount` feature only works with inline `price_data` — that's how this project is built.

**Tenant doesn't see the name/unit fields**
→ These are `custom_fields` on the Checkout Session. If they're missing, the Stripe account may need to be in a supported region. Check [Stripe docs on custom fields](https://stripe.com/docs/payments/checkout/customization#custom-fields).

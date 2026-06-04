// api/pay.js — Stripe "Pay Any Amount" Rent Payment Link
// Serverless function — stateless, no DB, no secrets in code.
// Every GET request creates a fresh Checkout Session and redirects the tenant.

"use strict";

const Stripe = require("stripe");

// ---------------------------------------------------------------------------
// Config — all values come from environment variables. NEVER hardcode keys.
// ---------------------------------------------------------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const SUCCESS_URL = process.env.SUCCESS_URL  || "https://illion-rent-pay.vercel.app/success.html";
const CANCEL_URL  = process.env.CANCEL_URL   || "https://illion-rent-pay.vercel.app/pay";

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
module.exports = async function handler(req, res) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price: "price_1Td5SHLWAevwCubqgnOgb03M",
          quantity: 1,
        },
      ],

      // Custom fields so the owner knows WHO paid on the shared link.
      // All 3 values appear on the payment record in the Stripe dashboard.
      custom_fields: [
        {
          key: "tenant_name",
          label: { type: "custom", custom: "Your full name" },
          type: "text",
        },
        {
          key: "flat_number",
          label: { type: "custom", custom: "Apartment number" },
          type: "text",
        },
        {
          key: "property_address",
          label: { type: "custom", custom: "Property address" },
          type: "text",
        },
      ],

      payment_intent_data: {
        description: "Rent Payment - Ilion Housing Authority",
      },

      success_url: SUCCESS_URL,
      cancel_url:  CANCEL_URL,
    });

    // 303 See Other — browser follows the redirect to Stripe's hosted page.
    res.writeHead(303, { Location: session.url });
    res.end();
  } catch (err) {
    // Log the real error server-side but never leak it to the tenant.
    console.error("[pay.js] Stripe session error:", err.message);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Something went wrong creating the payment session. Please try again.");
  }
};

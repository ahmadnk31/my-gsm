# Supabase Edge Functions

This directory contains Supabase Edge Functions for handling Stripe payments.

## Functions

### 1. create-checkout-session
Creates a Stripe Checkout Session for Express Checkout payments.

**Endpoint:** `/functions/v1/create-checkout-session`

**Method:** POST

**Body:**
```json
{
  "orderId": "order-uuid",
  "items": [
    {
      "name": "Product Name",
      "price": 29.99,
      "quantity": 1,
      "image": "https://example.com/image.jpg"
    }
  ],
  "shippingInfo": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "totalAmount": 2000, // Amount in cents
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel"
}
```

### 2. stripe-webhook
Handles Stripe webhook events to update order status.

**Endpoint:** `/functions/v1/stripe-webhook`

**Events handled:**
- `payment_intent.succeeded` - Updates order to paid status
- `payment_intent.payment_failed` - Updates order to failed status
- `checkout.session.completed` - Updates order to paid status for Express Checkout

## Setup

1. **Environment Variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Deploy Functions:**
   ```bash
   npx supabase functions deploy create-checkout-session
   npx supabase functions deploy stripe-webhook
   ```

3. **Configure Stripe Webhook:**
   - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`

## Development

These functions use Deno runtime and are written in TypeScript. The `@ts-nocheck` comment is used to prevent TypeScript errors in the IDE since these are Deno files, not Node.js files.

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

# 🔧 Webhook Setup Guide - Fix the Payment Status Issue

## The Problem
Your orders are staying in "pending" status because the webhook isn't updating them when payments succeed.

## Step-by-Step Fix

### 1. Go to Stripe Dashboard
1. Open [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click on **"Webhooks"** in the left sidebar

### 2. Create New Webhook Endpoint
1. Click **"+ Add endpoint"**
2. **Endpoint URL:** `https://sucnhkvmazniihfdrhyq.supabase.co/functions/v1/stripe-webhook`
3. **Description:** "Supabase Order Status Updates"

### 3. Select Events
Click **"Select events"** and add these events:
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded` 
- ✅ `payment_intent.payment_failed`

### 4. Save and Get Webhook Secret
1. Click **"Add endpoint"**
2. Click on your new webhook endpoint
3. Click **"Reveal"** next to "Signing secret"
4. Copy the webhook secret (starts with `whsec_...`)

### 5. Add Webhook Secret to Supabase
1. Go to [Supabase Dashboard → Settings → Edge Functions](https://supabase.com/dashboard/project/sucnhkvmazniihfdrhyq/settings/functions)
2. Add environment variable:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (the secret you copied)

### 6. Deploy the Webhook Function
Run this command in your terminal:
```bash
npx supabase functions deploy stripe-webhook
```

### 7. Test the Webhook
1. Make a test payment
2. Go to Stripe Dashboard → Webhooks → [Your webhook] → "Recent deliveries"
3. You should see a successful webhook call
4. Check your order status - it should update to "processing" and "paid"

## Quick Test
After setting up the webhook, make a test payment with:
- **Card:** `4242 4242 4242 4242`
- **Expiry:** `12/25`
- **CVC:** `123`

## Troubleshooting
If it still doesn't work:
1. Check webhook logs in Stripe Dashboard
2. Check Supabase Edge Function logs
3. Use the "Mark as Paid (Test)" button on the Order Confirmation page

## Alternative: Manual Status Update
If webhook setup is complex, you can manually update orders:
1. Go to Supabase Dashboard → Table Editor → orders
2. Find your order
3. Update `status` to "processing" and `payment_status` to "paid"

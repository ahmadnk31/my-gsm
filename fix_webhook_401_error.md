# 🔧 Fix Webhook 401 Error

## The Problem
Stripe webhook is returning 401 "Missing authorization header" error. This happens because the webhook secret is not configured properly.

## Step-by-Step Fix

### 1. Set Up Webhook in Stripe Dashboard

1. **Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)**
2. **Click "+ Add endpoint"**
3. **Set the URL:** `https://sucnhkvmazniihfdrhyq.supabase.co/functions/v1/stripe-webhook`
4. **Select events:** `checkout.session.completed`
5. **Click "Add endpoint"**

### 2. Get the Webhook Secret

1. **Click on your new webhook endpoint**
2. **Click "Reveal" next to "Signing secret"**
3. **Copy the webhook secret** (starts with `whsec_...`)

### 3. Add Webhook Secret to Supabase

1. **Go to [Supabase Dashboard → Settings → Edge Functions](https://supabase.com/dashboard/project/sucnhkvmazniihfdrhyq/settings/functions)**
2. **Add environment variable:**
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (the secret you copied from Stripe)

### 4. Test the Webhook

1. **Make a test payment** with card `4242 4242 4242 4242`
2. **Check Stripe Dashboard → Webhooks → [Your webhook] → "Recent deliveries"**
3. **Check Supabase Dashboard → Edge Functions → stripe-webhook → Logs**

### 5. Debug Information

The webhook function now logs:
- Whether it receives a request
- Whether it has a signature
- Whether it has a webhook secret
- What events it processes

## Common Issues:

1. **Webhook not created in Stripe Dashboard**
2. **Wrong webhook URL**
3. **Missing `checkout.session.completed` event**
4. **Webhook secret not added to Supabase environment variables**
5. **Webhook secret mismatch**

## Quick Test:

After setting up the webhook, make a test payment and check:
1. **Stripe Dashboard:** Webhook should show successful delivery
2. **Supabase Logs:** Should show webhook event received
3. **Order Status:** Should update from "pending" to "processing"

## Alternative: Use the Fallback System

If webhook setup is complex, the Order Confirmation page will automatically check payment status and update the order within 1 minute of payment completion.

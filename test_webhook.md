# Webhook Debugging Guide

## 1. Check Webhook Configuration in Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Make sure you have a webhook endpoint configured with:
   - **URL:** `https://sucnhkvmazniihfdrhyq.supabase.co/functions/v1/stripe-webhook`
   - **Events:** `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

## 2. Check Environment Variables in Supabase

1. Go to [Supabase Dashboard → Settings → Edge Functions](https://supabase.com/dashboard/project/sucnhkvmazniihfdrhyq/settings/functions)
2. Make sure you have:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (sk_test_...)
   - `STRIPE_WEBHOOK_SECRET`: Your webhook endpoint secret (whsec_...)

## 3. Test the Webhook

After making a test payment, check the webhook logs:

1. Go to [Supabase Dashboard → Edge Functions → stripe-webhook](https://supabase.com/dashboard/project/sucnhkvmazniihfdrhyq/functions/stripe-webhook)
2. Click on "Logs" to see the webhook execution logs
3. Look for the debug messages we added

## 4. Manual Test

You can also test the webhook manually by creating a test order and checking if it gets updated.

## Common Issues:

1. **Webhook secret mismatch**: Make sure the `STRIPE_WEBHOOK_SECRET` in Supabase matches the one from Stripe Dashboard
2. **Wrong events**: Make sure `checkout.session.completed` is selected in Stripe webhook settings
3. **RLS policies**: Make sure the webhook has permission to update orders (it uses service role key)
4. **Order ID format**: Make sure the order ID is a valid UUID

## Debug Steps:

1. Make a test payment
2. Check Stripe Dashboard → Webhooks → [Your webhook] → Recent deliveries
3. Check Supabase Edge Function logs
4. Check your orders table to see if the status was updated

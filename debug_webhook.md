# Webhook Debugging Steps

## 1. Check if Webhook is Configured in Stripe

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Check if you have a webhook endpoint with:
   - **URL:** `https://sucnhkvmazniihfdrhyq.supabase.co/functions/v1/stripe-webhook`
   - **Events:** `checkout.session.completed`

## 2. Check Webhook Logs in Stripe

1. Go to your webhook in Stripe Dashboard
2. Click on "Recent deliveries"
3. Look for recent webhook calls
4. Check if they're successful (green) or failed (red)

## 3. Check Supabase Edge Function Logs

1. Go to [Supabase Dashboard → Edge Functions](https://supabase.com/dashboard/project/sucnhkvmazniihfdrhyq/functions)
2. Click on `stripe-webhook`
3. Click on "Logs" tab
4. Look for recent executions and any error messages

## 4. Test the Webhook Manually

You can test if the webhook is working by making a test payment and checking:

1. **In Stripe Dashboard:**
   - Go to Payments → Look for your test payment
   - Check if the webhook was called

2. **In Supabase Dashboard:**
   - Go to Table Editor → orders
   - Check if the order status was updated from 'pending' to 'processing'
   - Check if payment_status was updated from 'pending' to 'paid'

## 5. Common Issues:

1. **Webhook not configured:** No webhook endpoint in Stripe
2. **Wrong URL:** Webhook URL doesn't match your Supabase function
3. **Missing events:** `checkout.session.completed` not selected
4. **Wrong webhook secret:** Environment variable doesn't match
5. **RLS policies:** Webhook can't update orders due to permissions

## 6. Quick Fix - Manual Status Update

If webhook is not working, you can manually update the order status:

1. Go to Supabase Dashboard → Table Editor → orders
2. Find your order
3. Update:
   - `status` from 'pending' to 'processing'
   - `payment_status` from 'pending' to 'paid'

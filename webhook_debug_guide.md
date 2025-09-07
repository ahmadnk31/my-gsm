# 🔧 Webhook Debug Guide

## Current Issue
- Payment succeeds on Stripe
- Webhook events are not being captured
- Orders are not being created in the database

## Step 1: Check Webhook Endpoint in Stripe Dashboard

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/webhooks
2. **Check if webhook endpoint exists**:
   - Look for an endpoint pointing to: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
   - If it doesn't exist, you need to create it

## Step 2: Create Webhook Endpoint (if missing)

1. **Click "Add endpoint"** in Stripe Dashboard
2. **Endpoint URL**: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
   - Replace `your-project-ref` with your actual Supabase project reference
3. **Events to send**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. **Click "Add endpoint"**
5. **Copy the webhook signing secret** (starts with `whsec_...`)

## Step 3: Set Webhook Secret in Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/sucnhkvmazniihfdrhyq/functions
2. **Click on "stripe-webhook" function**
3. **Go to "Settings" tab**
4. **Add environment variable**:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (the webhook signing secret from Stripe)
5. **Click "Save"**
6. **Redeploy the function**

## Step 4: Test the Webhook

1. **Make a test payment** through your app
2. **Check Stripe Dashboard → Webhooks → Your endpoint → Recent deliveries**
3. **Look for the `checkout.session.completed` event**
4. **Check if it shows HTTP 200 (success) or an error**

## Step 5: Check Supabase Function Logs

1. **Go to Supabase Dashboard → Edge Functions → stripe-webhook → Logs**
2. **Look for these logs**:
   - `Webhook request received:`
   - `Webhook event received:`
   - `Checkout session completed:`
   - `Order created successfully:`

## Step 6: Common Issues & Solutions

### Issue: "Missing signature or webhook secret"
- **Solution**: Make sure `STRIPE_WEBHOOK_SECRET` is set in Supabase function environment variables

### Issue: "Invalid signature"
- **Solution**: Make sure the webhook secret in Supabase matches the one in Stripe Dashboard

### Issue: "Webhook endpoint not found"
- **Solution**: Make sure the webhook URL in Stripe points to the correct Supabase function URL

### Issue: "CORS error"
- **Solution**: The function already has CORS headers, but make sure the webhook URL is correct

## Step 7: Manual Test

You can manually test the webhook by sending a test event:

1. **Go to Stripe Dashboard → Webhooks → Your endpoint**
2. **Click "Send test webhook"**
3. **Select "checkout.session.completed"**
4. **Click "Send test webhook"**
5. **Check Supabase function logs for the test event**

## Your Supabase Project Details

- **Project URL**: `https://sucnhkvmazniihfdrhyq.supabase.co`
- **Webhook URL**: `https://sucnhkvmazniihfdrhyq.supabase.co/functions/v1/stripe-webhook`
- **Function Name**: `stripe-webhook`

## Next Steps

1. **Verify webhook endpoint exists in Stripe**
2. **Set the webhook secret in Supabase**
3. **Test with a real payment**
4. **Check logs for any errors**

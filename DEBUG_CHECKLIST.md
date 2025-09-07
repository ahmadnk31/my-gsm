# 🚨 DEBUG CHECKLIST - Payment Flow Not Working

## Current Status
- ✅ Frontend checkout works (redirects to Stripe)
- ✅ Payment succeeds on Stripe
- ❌ Order not created in database
- ❌ Webhook not processing

## Step 1: Check Webhook Endpoint in Stripe Dashboard

**GO TO**: https://dashboard.stripe.com/webhooks

**CHECK**: Do you see an endpoint with URL:
```
https://sucnhkvmazniihfdrhyq.supabase.co/functions/v1/stripe-webhook
```

**IF NO ENDPOINT EXISTS**:
1. Click "Add endpoint"
2. URL: `https://sucnhkvmazniihfdrhyq.supabase.co/functions/v1/stripe-webhook`
3. Events: `checkout.session.completed`
4. Click "Add endpoint"
5. **COPY THE WEBHOOK SECRET** (starts with `whsec_...`)

## Step 2: Set Webhook Secret in Supabase

**GO TO**: https://supabase.com/dashboard/project/sucnhkvmazniihfdrhyq/functions

1. Click on "stripe-webhook" function
2. Go to "Settings" tab
3. Add environment variable:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (from Stripe)
4. Click "Save"
5. Click "Deploy" to redeploy the function

## Step 3: Test Payment Flow

1. Go to: http://localhost:8080/checkout
2. Fill out shipping info
3. Click "Pay with Stripe Express Checkout"
4. Use test card: `4242 4242 4242 4242`
5. Complete payment

## Step 4: Check What Happens

**AFTER PAYMENT**:
1. **Check browser console** for any errors
2. **Check Stripe Dashboard → Webhooks → Your endpoint → Recent deliveries**
3. **Check Supabase function logs**

## Step 5: Manual Webhook Test

**IN STRIPE DASHBOARD**:
1. Go to Webhooks → Your endpoint
2. Click "Send test webhook"
3. Select "checkout.session.completed"
4. Click "Send test webhook"
5. Check Supabase function logs

## Expected Flow

1. **User pays** → Stripe processes payment
2. **Stripe sends webhook** → `checkout.session.completed` event
3. **Supabase function receives webhook** → Creates order in database
4. **User sees order confirmation** → Order appears on page

## Common Issues

### Issue 1: No webhook endpoint in Stripe
- **Solution**: Create webhook endpoint in Stripe Dashboard

### Issue 2: Webhook secret not set
- **Solution**: Set `STRIPE_WEBHOOK_SECRET` in Supabase function

### Issue 3: Webhook endpoint URL wrong
- **Solution**: Make sure URL is exactly: `https://sucnhkvmazniihfdrhyq.supabase.co/functions/v1/stripe-webhook`

### Issue 4: Function not deployed
- **Solution**: Redeploy the stripe-webhook function in Supabase

## Debug Commands

Run these to check your setup:

```bash
# Check if functions are deployed
npx supabase functions list

# Check function logs
npx supabase functions logs stripe-webhook
```

## What to Share

If it still doesn't work, share:
1. **Screenshot of Stripe Dashboard → Webhooks** (showing your endpoint)
2. **Screenshot of Supabase function environment variables**
3. **Any error messages from browser console**
4. **Any error messages from Supabase function logs**

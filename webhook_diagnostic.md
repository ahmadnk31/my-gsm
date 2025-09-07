# 🔍 Webhook Diagnostic

## Check These Issues:

### 1. Webhook Endpoint in Stripe Dashboard
- Go to: https://dashboard.stripe.com/webhooks
- **DO YOU SEE** an endpoint with URL: `https://sucnhkvmazniihfdrhyq.supabase.co/functions/v1/stripe-webhook`?
- **IF NO**: Create it with events: `checkout.session.completed`

### 2. Webhook Secret in Supabase
- Go to: https://supabase.com/dashboard/project/sucnhkvmazniihfdrhyq/functions
- Click "stripe-webhook" → Settings
- **DO YOU SEE** `STRIPE_WEBHOOK_SECRET` environment variable?
- **IF NO**: Add it with the webhook secret from Stripe

### 3. Test Webhook Manually
In Stripe Dashboard:
1. Go to Webhooks → Your endpoint
2. Click "Send test webhook"
3. Select "checkout.session.completed"
4. Click "Send test webhook"
5. Check Supabase function logs

### 4. Check Function Logs
- Go to: https://supabase.com/dashboard/project/sucnhkvmazniihfdrhyq/functions
- Click "stripe-webhook" → Logs
- Look for webhook events

## Most Likely Issue:
**Webhook endpoint not configured in Stripe Dashboard**

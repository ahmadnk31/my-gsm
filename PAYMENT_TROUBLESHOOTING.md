# 💳 Payment System Troubleshooting Guide

## 🔍 **Common Payment Issues & Solutions**

Your payment system uses **Stripe Checkout** with Supabase Edge Functions. Here are the most common issues and their fixes:

---

## 🚨 **Issue 1: Stripe API Keys Missing/Invalid**

### **Symptoms**
- "Stripe failed to load" error
- "Failed to create checkout session" 
- Console error about missing API keys

### **Solution**
```bash
# Check your environment variables
echo $VITE_STRIPE_PUBLISHABLE_KEY
echo $STRIPE_SECRET_KEY
echo $STRIPE_WEBHOOK_SECRET
```

**Fix in `.env` file:**
```env
# Frontend (publishable key)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend (in Supabase dashboard → Edge Functions → Environment Variables)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🚨 **Issue 2: Webhook Not Working**

### **Symptoms**
- Payment succeeds in Stripe but order not created
- Order status stuck in "pending" 
- Cart not cleared after payment

### **Solution - Configure Stripe Webhook:**

1. **Go to Stripe Dashboard → Webhooks**
2. **Add endpoint:** `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. **Select events:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. **Copy webhook secret** to Supabase environment variables

### **Test Webhook:**
```bash
# Install Stripe CLI
stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhook

# Test with sample event
stripe trigger checkout.session.completed
```

---

## 🚨 **Issue 3: CORS/Authentication Errors**

### **Symptoms**
- "Missing authorization header" 
- 401 Unauthorized errors
- Network errors in browser console

### **Solution - Fix Environment Variables:**
```typescript
// In StripeExpressCheckout.tsx - check this line:
const authKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

**Should be:**
```typescript
const authKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

**Update your `.env`:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚨 **Issue 4: Database Schema Problems**

### **Symptoms**
- "Column does not exist" errors
- Order creation fails
- Database constraint violations

### **Solution - Run Migration:**
```sql
-- Check if orders table exists with correct schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public';

-- If missing columns, add them:
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
```

---

## 🚨 **Issue 5: Price Calculation Errors**

### **Symptoms**
- Wrong amounts charged
- Tax calculation issues
- Currency conversion problems

### **Solution - Fix Price Conversion:**
```typescript
// In create-checkout-session/index.ts - ensure proper conversion:
unit_amount: Math.round(item.price * 100), // Convert euros to cents

// In webhook - convert back:
total_amount: totalAmount / 100, // Convert cents to euros
```

---

## 🔧 **Quick Diagnostic Commands**

### **1. Check Environment Variables**
```javascript
// Run in browser console on your site:
console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

### **2. Test Checkout Session Creation**
```bash
# Test the edge function directly:
curl -X POST https://your-project.supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","items":[{"accessoryId":"1","name":"Test","price":10,"quantity":1}],"shippingInfo":{},"totalAmount":1000}'
```

### **3. Check Stripe Dashboard**
- Go to Stripe Dashboard → Payments
- Look for recent payment attempts
- Check webhook delivery logs

---

## 🛠️ **Immediate Fixes to Try**

### **Fix 1: Update Environment Variable Reference**
```typescript
// In src/components/StripeExpressCheckout.tsx, line ~47
// Change from:
const authKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// To:
const authKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### **Fix 2: Add Error Handling**
```typescript
// Add better error logging in StripeExpressCheckout.tsx
const handleExpressCheckout = async () => {
  // ... existing code ...
  
  try {
    console.log('Creating checkout session with:', {
      userId: user.id,
      itemCount: cartItems.length,
      totalAmount: Math.round(totalAmount * 100)
    });

    const response = await fetch(/* ... */);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Checkout session creation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    // ... rest of code
  } catch (error) {
    console.error('Detailed checkout error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    // ... existing error handling
  }
};
```

### **Fix 3: Verify Supabase Function Deployment**
```bash
# Check if functions are deployed
supabase functions list

# Redeploy if needed
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

---

## 📋 **Debugging Checklist**

**Environment Setup:**
- [ ] Stripe publishable key set in frontend
- [ ] Stripe secret key set in Supabase
- [ ] Webhook secret configured
- [ ] Supabase URL and anon key correct

**Database:**
- [ ] Orders table exists with correct schema
- [ ] Order_items table exists
- [ ] Cart_items table exists
- [ ] RLS policies allow operations

**Stripe Configuration:**
- [ ] Webhook endpoint configured
- [ ] Correct events selected
- [ ] Webhook is active and receiving events
- [ ] Test mode vs live mode consistency

**Code Issues:**
- [ ] Correct environment variable names
- [ ] Proper price conversion (cents ↔ euros)
- [ ] Authentication headers passed correctly
- [ ] Error handling in place

---

## 🎯 **Most Likely Fix**

Based on the code I analyzed, the most likely issue is the **environment variable reference**:

```typescript
// In StripeExpressCheckout.tsx, change this line:
const authKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// To:
const authKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

This would cause authentication errors when calling the Supabase Edge Function.

---

## 🔍 **Next Steps**

1. **Apply the environment variable fix** above
2. **Check browser console** for specific error messages
3. **Test a payment** and check Stripe dashboard
4. **Verify webhook delivery** in Stripe dashboard
5. **Check Supabase Edge Function logs**

**Let me know what specific error messages you're seeing, and I can provide more targeted assistance!** 💳✨

*Payment troubleshooting guide created: September 23, 2025*

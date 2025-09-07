// @ts-nocheck
// This is a Deno Edge Function, not a Node.js file
import { serve } from "std/http/server.ts"
import { createClient } from "supabase"
import Stripe from "stripe"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    console.log('Webhook request received:', {
      hasBody: !!body,
      hasSignature: !!signature,
      hasWebhookSecret: !!webhookSecret,
      method: req.method,
      url: req.url
    })

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret:', {
        hasSignature: !!signature,
        hasWebhookSecret: !!webhookSecret
      })
      throw new Error('Missing signature or webhook secret')
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '')
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Webhook event received:', {
      type: event.type,
      id: event.id,
      created: event.created
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (orderId) {
          // Update order status in database
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              stripe_payment_intent_id: paymentIntent.id,
              status: 'processing'
            })
            .eq('id', orderId)
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        const failedOrderId = failedPayment.metadata.orderId

        if (failedOrderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              stripe_payment_intent_id: failedPayment.id
            })
            .eq('id', failedOrderId)
        }
        break

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const userEmail = session.metadata?.userEmail
        const items = JSON.parse(session.metadata?.items || '[]')
        const shippingInfo = JSON.parse(session.metadata?.shippingInfo || '{}')
        const totalAmount = parseInt(session.metadata?.totalAmount || '0')

        console.log('Checkout session completed:', {
          sessionId: session.id,
          userId: userId,
          userEmail: userEmail,
          paymentIntent: session.payment_intent,
          totalAmount: totalAmount
        })

        if (userId && items.length > 0) {
          // Calculate subtotal, tax, and shipping
          const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
          const taxRate = 0.21 // 21% VAT
          const taxAmount = subtotal * taxRate
          const shippingAmount = subtotal < 50 ? 5.99 : 0

          // Create order
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              user_id: userId,
              subtotal,
              tax_amount: taxAmount,
              shipping_amount: shippingAmount,
              total_amount: totalAmount / 100, // Convert from cents
              shipping_address: shippingInfo,
              billing_address: shippingInfo,
              status: 'processing',
              payment_status: 'paid',
              stripe_payment_intent_id: session.payment_intent,
              stripe_session_id: session.id,
            })
            .select()
            .single()

          if (orderError) {
            console.error('Error creating order:', orderError)
          } else {
            console.log('Order created successfully:', order)

            // Create order items
            const orderItems = items.map((item: any) => ({
              order_id: order.id,
              accessory_id: item.accessoryId,
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.price * item.quantity,
            }))

            const { error: itemsError } = await supabase
              .from('order_items')
              .insert(orderItems)

            if (itemsError) {
              console.error('Error creating order items:', itemsError)
            } else {
              console.log('Order items created successfully')
            }

            // Clear cart
            await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', userId)
          }
        } else {
          console.error('Missing required data in session metadata')
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

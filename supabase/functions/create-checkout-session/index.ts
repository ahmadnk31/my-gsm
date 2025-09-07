// @ts-nocheck
import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import Stripe from "stripe";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-12-18.acacia',
    });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header received:', !!authHeader);
    console.log('Authorization header value:', authHeader?.substring(0, 20) + '...');
    
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with user context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the request body
    const { userId, items, shippingInfo, totalAmount, successUrl, cancelUrl } = await req.json();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal', 'bancontact', 'sofort', 'giropay'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: shippingInfo.email,
      shipping_address_collection: {
        allowed_countries: ['NL', 'BE', 'DE', 'FR', 'GB'],
      },
      metadata: {
        userId: userId,
        userEmail: shippingInfo.email,
        items: JSON.stringify(items),
        shippingInfo: JSON.stringify(shippingInfo),
        totalAmount: totalAmount.toString(),
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create checkout session',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

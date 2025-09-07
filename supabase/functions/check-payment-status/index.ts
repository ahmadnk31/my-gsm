// @ts-nocheck
import { serve } from "std/http/server.ts";
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

    // Get the request body
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Determine payment status
    let paymentStatus = 'pending';
    if (session.payment_status === 'paid') {
      paymentStatus = 'paid';
    } else if (session.payment_status === 'unpaid') {
      paymentStatus = 'failed';
    }

    return new Response(
      JSON.stringify({ 
        paymentStatus,
        sessionStatus: session.payment_status,
        sessionId: session.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error checking payment status:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to check payment status',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

type QuoteRequest = Tables<'quote_requests'>;

export const useQuoteRequests = () => {
  const { user } = useAuth();
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuoteRequests = async () => {
    if (!user) {
      setQuoteRequests([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // If not admin, only show user's own requests
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (userRole?.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setQuoteRequests(data || []);
    } catch (error) {
      console.error('Error fetching quote requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteRequest = async (
    id: string, 
    updates: Partial<Pick<QuoteRequest, 'quoted_price' | 'quote_notes' | 'status' | 'admin_notes'>>
  ) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Refresh the list
      await fetchQuoteRequests();
      
      return { success: true };
    } catch (error) {
      console.error('Error updating quote request:', error);
      return { success: false, error };
    }
  };

  const createBookingFromQuote = async (quoteId: string) => {
    try {
      // Get the quote request details
      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) throw quoteError;

      // Create a booking from the quote
      const bookingData = {
        user_id: quote.user_id,
        device_type: quote.custom_device_info || 'Unknown Device',
        device_model: quote.custom_device_info || 'Unknown Model',
        issue_description: quote.issue_description,
        customer_name: quote.customer_name,
        customer_email: quote.customer_email,
        customer_phone: quote.customer_phone || '',
        quoted_price: quote.quoted_price,
        estimated_cost: quote.quoted_price,
        preferred_date: new Date().toISOString().split('T')[0], // Today's date
        preferred_time: '09:00', // Default time
        quote_request_id: quote.id,
        status: 'pending' as const
      };

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (bookingError) throw bookingError;

      // Update quote status to accepted
      await updateQuoteRequest(quoteId, { status: 'accepted' });

      return { success: true };
    } catch (error) {
      console.error('Error creating booking from quote:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchQuoteRequests();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('quote_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_requests'
        },
        () => {
          fetchQuoteRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    quoteRequests,
    loading,
    updateQuoteRequest,
    createBookingFromQuote,
    refreshQuoteRequests: fetchQuoteRequests
  };
};

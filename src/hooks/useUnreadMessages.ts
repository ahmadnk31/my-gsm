import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchUnreadCounts = async () => {
    if (!user) {
      setUnreadCounts({});
      setLoading(false);
      return;
    }

    try {
      // Get all bookings for the user first
      const { data: userBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id);

      if (!userBookings || userBookings.length === 0) {
        setUnreadCounts({});
        setLoading(false);
        return;
      }

      const unreadRecord: Record<string, number> = {};

      // For each booking, count unread messages
      for (const booking of userBookings) {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', booking.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        unreadRecord[booking.id] = count || 0;
      }

      setUnreadCounts(unreadRecord);
    } catch (error) {
      console.error('Error in fetchUnreadCounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCounts();
  }, [user]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('unread_messages_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          // Refetch unread counts when messages are inserted/updated
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (bookingId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', bookingId)
        .neq('sender_id', user.id);

      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }

      // Update local state
      setUnreadCounts(prev => ({
        ...prev,
        [bookingId]: 0
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return {
    unreadCounts,
    loading,
    refreshUnreadCounts: fetchUnreadCounts,
    markAsRead
  };
};

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Booking {
  id: string;
  device_type: string;
  device_model: string;
  issue_description: string;
  preferred_date: string;
  preferred_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  estimated_cost?: number;
  actual_cost?: number;
  quoted_price?: number;
  notes?: string;
  created_at: string;
  part_id?: string;
  selected_quality_type?: string;
  device_parts?: {
    name: string;
    category: string;
  } | null;
  user_id: string;
}

export const useRealtimeBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      if (userRole === 'admin') {
        // Admin can see all bookings
        const { data: allData, error: allError } = await supabase
          .from('bookings')
          .select(`
            *,
            device_parts (
              name,
              category
            )
          `)
          .order('created_at', { ascending: false });
        
        if (allError) throw allError;
        setAllBookings((allData || []) as Booking[]);
        
        // Admin's personal bookings (filter from all bookings)
        const personalBookings = (allData || []).filter(booking => booking.user_id === user?.id);
        setBookings(personalBookings as Booking[]);
      } else {
        // Regular users can only see their own bookings
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            device_parts (
              name,
              category
            )
          `)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setBookings((data || []) as Booking[]);
        setAllBookings([]); // Regular users don't need allBookings
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Booking status has been updated to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchBookings();

    // Set up real-time subscription
    const channel = supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: userRole === 'admin' ? undefined : `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Booking change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newBooking = payload.new as Booking;
            
            if (userRole === 'admin') {
              // Admin users only update allBookings
              toast({
                title: "New Booking",
                description: `${newBooking.customer_name} booked a repair for ${newBooking.device_type} ${newBooking.device_model}`,
              });
              setAllBookings(prev => [newBooking, ...prev]);
            } else {
              // Regular users only update their personal bookings if they own this booking
              if (newBooking.user_id === user.id) {
                setBookings(prev => [newBooking, ...prev]);
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedBooking = payload.new as Booking;
            
            // Update bookings lists
            if (userRole === 'admin') {
              // Admin users only update allBookings, not their personal bookings
              setAllBookings(prev => 
                prev.map(booking => 
                  booking.id === updatedBooking.id ? updatedBooking : booking
                )
              );
            } else {
              // Regular users only update their personal bookings if they own this booking
              if (updatedBooking.user_id === user.id) {
                setBookings(prev => 
                  prev.map(booking => 
                    booking.id === updatedBooking.id ? updatedBooking : booking
                  )
                );
                
                // Show status change notification only to the booking owner
                if (payload.old?.status !== updatedBooking.status) {
                  const statusMessage = getStatusMessage(updatedBooking.status);
                  toast({
                    title: "Booking Status Updated",
                    description: `Your ${updatedBooking.device_type} ${updatedBooking.device_model} repair is now ${statusMessage}`,
                  });
                }
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              if (userRole === 'admin') {
                // Admin users only update allBookings
                setAllBookings(prev => prev.filter(booking => booking.id !== deletedId));
              } else {
                // Regular users only update their personal bookings
                setBookings(prev => prev.filter(booking => booking.id !== deletedId));
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole, toast]);

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'pending confirmation';
      case 'confirmed': return 'confirmed and scheduled';
      case 'in-progress': return 'being repaired';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return status;
    }
  };

  return {
    bookings,
    allBookings,
    loading,
    updateBookingStatus,
    refreshBookings: fetchBookings
  };
};

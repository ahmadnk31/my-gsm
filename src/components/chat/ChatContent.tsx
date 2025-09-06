import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

interface ChatConversation {
  id: string;
  booking_id: string;
  customer_id: string;
  technician_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChatContentProps {
  bookingId: string;
}

export function ChatContent({ bookingId }: ChatContentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (bookingId && user) {
      initializeChat();
      // Mark messages as read when chat is opened
      const markMessagesAsRead = async () => {
        try {
          await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('conversation_id', bookingId)
            .neq('sender_id', user.id);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      };
      markMessagesAsRead();
    }
  }, [bookingId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    setLoading(true);
    try {
      // Get or create conversation for this booking
      let { data: existingConversation, error: conversationError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (conversationError && conversationError.code !== 'PGRST116') {
        throw conversationError;
      }

      if (!existingConversation) {
        // Create new conversation if it doesn't exist
        const { data: newConversation, error: createError } = await supabase
          .from('chat_conversations')
          .insert({
            booking_id: bookingId,
            customer_id: user?.id || ''
          })
          .select()
          .single();

        if (createError) throw createError;
        existingConversation = newConversation;
      }

      setConversation(existingConversation);

      // Fetch messages for this conversation
      await fetchMessages(existingConversation.id);

      // Set up real-time subscription for messages
      setupRealtimeSubscription(existingConversation.id);

    } catch (error: any) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await markMessagesAsRead(conversationId);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user?.id);
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
    }
  };

  const setupRealtimeSubscription = (conversationId: string) => {
    // Remove any existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('Setting up real-time subscription for conversation:', conversationId);

    const channel = supabase
      .channel(`chat_messages_${conversationId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user?.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('📨 Received new message via realtime:', payload);
          const newMessage = payload.new as ChatMessage;
          
          // Update messages state
          setMessages(prev => {
            // Check if message already exists (avoid duplicates)
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping:', newMessage.id);
              return prev;
            }
            
            console.log('Adding new message to state:', newMessage.id);
            return [...prev, newMessage];
          });

          // Show notification if message is from someone else
          if (newMessage.sender_id !== user?.id) {
            toast({
              title: "New Message",
              description: newMessage.message,
            });
          }
        }
      )
      .subscribe((status, err) => {
        console.log('🔔 Subscription status:', status, err);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to chat updates for conversation:', conversationId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Subscription error:', err);
          toast({
            title: "Connection Error",
            description: "Real-time chat may not work properly",
            variant: "destructive",
          });
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Subscription timed out, attempting to reconnect...');
          // Retry subscription after a delay
          setTimeout(() => setupRealtimeSubscription(conversationId), 2000);
        }
      });

    channelRef.current = channel;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) return;

    const messageText = newMessage.trim();
    setSending(true);
    
    // Clear input immediately for better UX
    setNewMessage('');

    // Create temporary message for optimistic update
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: user?.id || '',
      message: messageText,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString()
    };

    // Add message optimistically
    setMessages(prev => [...prev, tempMessage]);

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user?.id || '',
          message: messageText,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temporary message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? data : msg
        )
      );

      console.log('Message sent successfully:', data);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      
      // Restore message text
      setNewMessage(messageText);
      
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, msgs]) => ({
      date,
      messages: msgs
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupMessagesByDate(messages).map(({ date, messages: dayMessages }) => (
              <div key={date}>
                <div className="flex justify-center my-4">
                  <Badge variant="secondary" className="text-xs">
                    {formatDate(dayMessages[0].created_at)}
                  </Badge>
                </div>
                {dayMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex mb-3",
                      message.sender_id === user?.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "flex items-start gap-2 max-w-[70%]",
                      message.sender_id === user?.id ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        message.sender_id === user?.id 
                          ? "bg-primary text-white" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {message.sender_id === user?.id ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Wrench className="h-4 w-4" />
                        )}
                      </div>
                      <div className={cn(
                        "rounded-lg px-3 py-2 max-w-full",
                        message.sender_id === user?.id
                          ? "bg-primary text-white"
                          : "bg-muted"
                      )}>
                        <p className="text-sm break-words">{message.message}</p>
                        <p className={cn(
                          "text-xs mt-1 opacity-70",
                          message.sender_id === user?.id ? "text-white" : "text-muted-foreground"
                        )}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="flex-shrink-0 border-t bg-background p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

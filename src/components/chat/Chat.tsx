import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

interface ChatProps {
  bookingId: string;
  children: React.ReactNode;
}

export function Chat({ bookingId, children }: ChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open && bookingId) {
      initializeChat();
    }
  }, [open, bookingId]);

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
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);

          // Show notification if message is from someone else
          if (newMessage.sender_id !== user?.id) {
            toast({
              title: "New Message",
              description: "You have received a new message",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user?.id || '',
          message: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat with Technician
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 p-4 border rounded-lg">
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
            </ScrollArea>

            <div className="flex gap-2 mt-4">
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
        )}
      </DialogContent>
    </Dialog>
  );
}

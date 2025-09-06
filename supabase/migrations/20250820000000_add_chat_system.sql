-- Add chat system for booking communication
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  technician_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_booking_id ON chat_conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_customer_id ON chat_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_technician_id ON chat_conversations(technician_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_conversations
CREATE POLICY "Users can view their own conversations" ON chat_conversations
  FOR SELECT USING (
    customer_id = auth.uid() OR 
    technician_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Customers can create conversations for their bookings" ON chat_conversations
  FOR INSERT WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and technicians can update conversations" ON chat_conversations
  FOR UPDATE USING (
    technician_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for chat_messages
CREATE POLICY "Users can view messages in their conversations" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = conversation_id AND (
        c.customer_id = auth.uid() OR 
        c.technician_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = conversation_id AND (
        c.customer_id = auth.uid() OR 
        c.technician_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Function to automatically create conversation when booking is created
CREATE OR REPLACE FUNCTION create_conversation_for_booking()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chat_conversations (booking_id, customer_id)
  VALUES (NEW.id, NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create conversation when booking is created
DROP TRIGGER IF EXISTS create_conversation_trigger ON bookings;
CREATE TRIGGER create_conversation_trigger
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_for_booking();

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when message is added
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON chat_messages;
CREATE TRIGGER update_conversation_timestamp_trigger
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

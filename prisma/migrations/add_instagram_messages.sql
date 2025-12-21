-- Create Instagram messages table
CREATE TABLE IF NOT EXISTS instagram_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ig_sender TEXT NOT NULL,
    ig_recipient TEXT NOT NULL,
    text TEXT,
    timestamp BIGINT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_instagram_messages_timestamp ON instagram_messages(timestamp DESC);
CREATE INDEX idx_instagram_messages_direction ON instagram_messages(direction);
CREATE INDEX idx_instagram_messages_sender ON instagram_messages(ig_sender);

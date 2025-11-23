-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table to store connected Instagram Business accounts
CREATE TABLE IF NOT EXISTS public.instagram_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ig_user_id text NOT NULL UNIQUE,
  fb_page_id text NOT NULL UNIQUE,
  name text NOT NULL,
  username text NOT NULL,
  profile_picture_url text,
  access_token text NOT NULL,
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'connected',
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table to store connected WhatsApp Business accounts
CREATE TABLE IF NOT EXISTS public.whatsapp_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number_id text NOT NULL UNIQUE,
  waba_id text NOT NULL,
  phone_number text NOT NULL UNIQUE,
  name text,
  access_token text NOT NULL,
  webhook_verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'connected',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table to persist Instagram DMs for future AI/CRM workflows
CREATE TABLE IF NOT EXISTS public.instagram_dms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_account_id uuid NOT NULL REFERENCES public.instagram_accounts(id) ON DELETE CASCADE,
  sender_id text NOT NULL,
  recipient_id text NOT NULL,
  message text,
  is_read boolean NOT NULL DEFAULT false,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table to persist WhatsApp messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_account_id uuid NOT NULL REFERENCES public.whatsapp_accounts(id) ON DELETE CASCADE,
  sender_id text NOT NULL,
  recipient_id text NOT NULL,
  message text,
  is_read boolean NOT NULL DEFAULT false,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable row level security for the integration tables
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_dms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Instagram accounts
CREATE POLICY IF NOT EXISTS "instagram_accounts_owner" ON public.instagram_accounts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for WhatsApp accounts
CREATE POLICY IF NOT EXISTS "whatsapp_accounts_owner" ON public.whatsapp_accounts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for Instagram DMs
CREATE POLICY IF NOT EXISTS "instagram_dms_owner" ON public.instagram_dms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.instagram_accounts ia
      WHERE ia.id = instagram_dms.instagram_account_id
        AND ia.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "instagram_dms_owner_insert" ON public.instagram_dms
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.instagram_accounts ia
      WHERE ia.id = instagram_dms.instagram_account_id
        AND ia.user_id = auth.uid()
    )
  );

-- Policies for WhatsApp messages
CREATE POLICY IF NOT EXISTS "whatsapp_messages_owner" ON public.whatsapp_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.whatsapp_accounts wa
      WHERE wa.id = whatsapp_messages.whatsapp_account_id
        AND wa.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "whatsapp_messages_owner_insert" ON public.whatsapp_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.whatsapp_accounts wa
      WHERE wa.id = whatsapp_messages.whatsapp_account_id
        AND wa.user_id = auth.uid()
    )
  );

-- Helpful index for faster lookups
CREATE INDEX IF NOT EXISTS instagram_accounts_user_id_idx ON public.instagram_accounts(user_id);
CREATE INDEX IF NOT EXISTS whatsapp_accounts_user_id_idx ON public.whatsapp_accounts(user_id);
CREATE INDEX IF NOT EXISTS instagram_dms_account_idx ON public.instagram_dms(instagram_account_id);
CREATE INDEX IF NOT EXISTS whatsapp_messages_account_idx ON public.whatsapp_messages(whatsapp_account_id);

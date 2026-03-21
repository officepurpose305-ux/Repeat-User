-- Fix live_config table for real-time sync
-- This ensures the table is created with the correct schema and RLS

-- Drop if exists (fresh start)
DROP TABLE IF EXISTS public.live_config CASCADE;

-- Create table with correct schema
CREATE TABLE public.live_config (
  id text PRIMARY KEY DEFAULT 'default',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_live_config_updated_at BEFORE UPDATE
  ON public.live_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.live_config ENABLE ROW LEVEL SECURITY;

-- Create permissive policy to allow all operations
CREATE POLICY "Allow all live_config access" ON public.live_config
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default row
INSERT INTO public.live_config (id, config)
VALUES ('default', '{"stage":1,"location":{"primary":null,"secondary":null,"city":null,"openToNearby":false},"filters":{"budgetMin":70,"budgetMax":95,"bhk":["2BHK"],"readyToMove":"either","buyTimeline":"exploring"},"behavior":{"developerContact":"none","visitedSite":false,"priceSensitivity":"medium"}}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_config TO anon, authenticated;

-- Create table for storing exported data snapshots
CREATE TABLE public.data_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  export_type TEXT NOT NULL, -- 'blocks', 'markets', 'derivatives', 'staking', etc.
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS but allow public read for exports
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read exports (public data)
CREATE POLICY "Exports are publicly readable" 
ON public.data_exports 
FOR SELECT 
USING (true);

-- Allow inserts from authenticated users or service role
CREATE POLICY "Allow inserts" 
ON public.data_exports 
FOR INSERT 
WITH CHECK (true);
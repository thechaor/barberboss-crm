-- Create client_notes table for storing notes about clients
CREATE TABLE IF NOT EXISTS public.client_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

-- Admins can manage all notes
CREATE POLICY "Admins can manage notes" ON public.client_notes
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Barbers can manage all notes
CREATE POLICY "Barbers can manage notes" ON public.client_notes  
  FOR ALL 
  USING (has_role(auth.uid(), 'barber'::app_role));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON public.client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_author_id ON public.client_notes(author_id);
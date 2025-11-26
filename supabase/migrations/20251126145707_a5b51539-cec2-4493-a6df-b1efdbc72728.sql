-- Create barbers table
CREATE TABLE public.barbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can view active barbers
CREATE POLICY "Anyone can view active barbers"
ON public.barbers
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert barbers
CREATE POLICY "Admins can insert barbers"
ON public.barbers
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update barbers
CREATE POLICY "Admins can update barbers"
ON public.barbers
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete barbers
CREATE POLICY "Admins can delete barbers"
ON public.barbers
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add appointment status for completed appointments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'appointment_status' 
    AND 'completed' = ANY(enum_range(NULL::appointment_status)::text[])
  ) THEN
    ALTER TYPE appointment_status ADD VALUE 'completed';
  END IF;
END $$;
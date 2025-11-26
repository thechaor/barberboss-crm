-- Add birthday field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birthday DATE;

-- Add barber_id to appointments table to track which barber handled the appointment
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS barber_id UUID REFERENCES public.barbers(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_barber_id ON public.appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_profiles_birthday ON public.profiles(birthday);

-- Update RLS policies for barbers to manage their appointments

-- Allow barbers to view appointments assigned to them
CREATE POLICY "Barbers can view their appointments"
ON public.appointments
FOR SELECT
USING (
  has_role(auth.uid(), 'barber'::app_role) 
  AND barber_id IN (SELECT id FROM public.barbers WHERE created_by = auth.uid())
);

-- Allow barbers to update their appointments (confirm/deny)
CREATE POLICY "Barbers can update their appointments"
ON public.appointments
FOR UPDATE
USING (
  has_role(auth.uid(), 'barber'::app_role) 
  AND barber_id IN (SELECT id FROM public.barbers WHERE created_by = auth.uid())
);
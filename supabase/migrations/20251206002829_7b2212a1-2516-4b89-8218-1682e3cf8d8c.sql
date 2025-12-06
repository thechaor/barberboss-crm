
-- 1. Create a public view for barbers that only exposes non-sensitive data
CREATE OR REPLACE VIEW public.barbers_public AS
SELECT 
  id,
  name,
  photo_url,
  is_active
FROM public.barbers
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.barbers_public TO anon, authenticated;

-- 2. Drop existing permissive policies on client_notes
DROP POLICY IF EXISTS "Admins can manage notes" ON public.client_notes;
DROP POLICY IF EXISTS "Barbers can manage notes" ON public.client_notes;

-- 3. Create more restrictive policies for client_notes
-- Admins can do everything
CREATE POLICY "Admins can view all notes" 
ON public.client_notes 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert notes" 
ON public.client_notes 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND author_id = auth.uid());

CREATE POLICY "Admins can update their own notes" 
ON public.client_notes 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) AND author_id = auth.uid());

CREATE POLICY "Admins can delete their own notes" 
ON public.client_notes 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role) AND author_id = auth.uid());

-- Barbers can view and create notes, but only update/delete their own
CREATE POLICY "Barbers can view all notes" 
ON public.client_notes 
FOR SELECT 
USING (has_role(auth.uid(), 'barber'::app_role));

CREATE POLICY "Barbers can insert notes" 
ON public.client_notes 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'barber'::app_role) AND author_id = auth.uid());

CREATE POLICY "Barbers can update their own notes" 
ON public.client_notes 
FOR UPDATE 
USING (has_role(auth.uid(), 'barber'::app_role) AND author_id = auth.uid());

CREATE POLICY "Barbers can delete their own notes" 
ON public.client_notes 
FOR DELETE 
USING (has_role(auth.uid(), 'barber'::app_role) AND author_id = auth.uid());

-- 4. Create a separate storage bucket for barber photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-photos', 'barber-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Create storage policies for barber-photos bucket
CREATE POLICY "Anyone can view barber photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'barber-photos');

CREATE POLICY "Admins can upload barber photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'barber-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update barber photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'barber-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete barber photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'barber-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Create gallery table
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gallery table
CREATE POLICY "Anyone can view active gallery images"
  ON public.gallery
  FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert gallery images"
  ON public.gallery
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery images"
  ON public.gallery
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery images"
  ON public.gallery
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true);

-- Storage policies for gallery bucket
CREATE POLICY "Anyone can view gallery images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update gallery images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'gallery' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete gallery images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'gallery' 
    AND has_role(auth.uid(), 'admin')
  );
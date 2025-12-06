
-- Fix: Recreate the view without SECURITY DEFINER (use SECURITY INVOKER which is the default)
DROP VIEW IF EXISTS public.barbers_public;

CREATE VIEW public.barbers_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  photo_url,
  is_active
FROM public.barbers
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.barbers_public TO anon, authenticated;

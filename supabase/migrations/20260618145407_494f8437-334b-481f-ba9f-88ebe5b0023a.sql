
-- 1. Barbers: hide email/phone from public, admins only for direct table access
DROP POLICY IF EXISTS "Anyone can view active barbers" ON public.barbers;
CREATE POLICY "Admins can view all barbers"
ON public.barbers FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Barbers can view themselves"
ON public.barbers FOR SELECT
USING (auth.uid() = created_by AND has_role(auth.uid(), 'barber'::app_role));

-- 2. Appointments: stricter INSERT validation
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
CREATE POLICY "Anyone can create valid appointments"
ON public.appointments FOR INSERT
WITH CHECK (
  length(trim(client_name)) BETWEEN 2 AND 100
  AND length(trim(client_phone)) BETWEEN 8 AND 20
  AND (client_email IS NULL OR (length(client_email) <= 255 AND client_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
  AND appointment_date >= CURRENT_DATE
  AND appointment_date <= (CURRENT_DATE + INTERVAL '1 year')
  AND barber_id IS NOT NULL
  AND service_id IS NOT NULL
  AND status = 'pending'::appointment_status
);

-- 3. user_roles: replace ALL policy with explicit per-command policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Public buckets: remove blanket listing SELECT policies (files still accessible via public URL)
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view barber photos" ON storage.objects;

-- 5. has_role: revoke EXECUTE from public roles (RLS still works as policy expressions run with table owner privileges)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read access to images bucket" ON storage.objects;
CREATE POLICY "Public read access to images bucket"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'images');
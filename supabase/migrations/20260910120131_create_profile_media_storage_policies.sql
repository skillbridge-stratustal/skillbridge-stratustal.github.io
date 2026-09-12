/*
# Storage policies for profile-media bucket

1. Storage Policies
- Public read: anyone can view files in the profile-media bucket.
- Authenticated upload: users can upload to their own folder (user_id/).
- Authenticated update: users can update their own files.
- Authenticated delete: users can delete their own files.
*/

-- Public read access
DROP POLICY IF EXISTS "public_read_profile_media" ON storage.objects;
CREATE POLICY "public_read_profile_media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'profile-media');

-- Authenticated users can upload to their own folder
DROP POLICY IF EXISTS "auth_upload_profile_media" ON storage.objects;
CREATE POLICY "auth_upload_profile_media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Authenticated users can update their own files
DROP POLICY IF EXISTS "auth_update_profile_media" ON storage.objects;
CREATE POLICY "auth_update_profile_media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-media' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'profile-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Authenticated users can delete their own files
DROP POLICY IF EXISTS "auth_delete_profile_media" ON storage.objects;
CREATE POLICY "auth_delete_profile_media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-media' AND (storage.foldername(name))[1] = auth.uid()::text);

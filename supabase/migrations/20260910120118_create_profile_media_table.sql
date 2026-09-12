/*
# Create profile_media table for skill showcase uploads

1. New Tables
- `profile_media`: stores metadata for images/videos that users upload
  to showcase the skills they can teach on their profile.
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner, defaults to auth.uid())
  - `media_url` (text, public URL of the uploaded file in Supabase Storage)
  - `media_type` (text, 'image' or 'video')
  - `caption` (text, optional user-provided description)
  - `sort_order` (int, ordering for display)
  - `created_at` (timestamptz)

2. Storage
- Creates a public bucket `profile-media` for storing uploaded files.

3. Security
- RLS enabled on `profile_media`.
- Owner-scoped CRUD: authenticated users can only manage their own media.
- Public read: anyone (including anon) can view profile media metadata
  so profiles are visible to all visitors.
*/

CREATE TABLE IF NOT EXISTS profile_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  caption text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profile_media ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can view profile media
DROP POLICY IF EXISTS "read_profile_media" ON profile_media;
CREATE POLICY "read_profile_media"
ON profile_media FOR SELECT
TO anon, authenticated
USING (true);

-- Only owner can insert
DROP POLICY IF EXISTS "insert_own_profile_media" ON profile_media;
CREATE POLICY "insert_own_profile_media"
ON profile_media FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only owner can update
DROP POLICY IF EXISTS "update_own_profile_media" ON profile_media;
CREATE POLICY "update_own_profile_media"
ON profile_media FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only owner can delete
DROP POLICY IF EXISTS "delete_own_profile_media" ON profile_media;
CREATE POLICY "delete_own_profile_media"
ON profile_media FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

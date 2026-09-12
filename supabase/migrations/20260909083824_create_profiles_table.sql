/*
# Create profiles table for Supabase Auth integration

## What this does
Creates a `profiles` table that extends `auth.users` with application-specific
fields (name, avatar, skills, bio, location). Each row maps 1:1 to an
`auth.users` row via its UUID primary key.

## New Tables
- `profiles`
  - `id` (uuid, primary key — matches auth.users.id)
  - `email` (text — copied from auth.users at signup for display)
  - `name` (text — user's display name)
  - `avatar` (text — URL to profile picture)
  - `location` (text — user's location, optional)
  - `bio` (text — user's bio, optional)
  - `teach_skills` (text[] — skills the user can teach)
  - `learn_skills` (text[] — skills the user wants to learn)
  - `is_default` (boolean — marks seed/community profiles)
  - `created_at` (timestamptz)

## Security
- RLS enabled on `profiles`.
- SELECT: anyone (anon + authenticated) can read profiles — the Explore page
  shows all profiles to logged-in users, and we need anon to read for the
  community page. This is intentional shared/public data.
- INSERT: only authenticated users can insert their own profile row.
- UPDATE: only the profile owner can update their row.
- DELETE: only the profile owner can delete their row.

## Important notes
1. The `id` column references `auth.users(id)` so each profile is tied to a
   real auth account.
2. We insert default community profiles with fixed UUIDs so they are
   consistent across environments.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  avatar text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  teach_skills text[] NOT NULL DEFAULT '{}',
  learn_skills text[] NOT NULL DEFAULT '{}',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: public read (community/explore pages show all profiles)
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: only the owner can create their profile
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: only the owner can update their profile
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: only the owner can delete their profile
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

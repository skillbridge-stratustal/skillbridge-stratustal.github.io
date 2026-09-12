/*
# Add gender column to profiles table

1. Changes
- Adds a `gender` text column to the `profiles` table.
- The column is nullable so existing profiles are not affected.
- Used to store the user's selected gender ("male", "female", or "other") during sign-up.
- This value drives gender-matched avatar generation via the RandomUser API.
2. Security
- No RLS policy changes. Existing policies on `profiles` remain unchanged.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS gender text;

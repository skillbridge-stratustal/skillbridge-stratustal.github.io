/*
# Remove FK constraint on profiles.id for seed profiles

## What this does
The `profiles` table had a foreign key on `id` referencing `auth.users(id)`.
This prevents inserting seed/community profiles that don't have a real auth
account. We drop the FK constraint so community showcase profiles can exist
with standalone UUIDs.

## Changes
- Drops the `profiles_id_fkey` foreign key constraint.
- The `id` column remains a uuid primary key.

## Security
- No RLS policy changes — existing policies remain intact.

## Important notes
1. Real user profiles created via signup will have their `id` set to the
   `auth.users.id` UUID, which is just a uuid — no FK needed since we look
   up profiles by id rather than joining.
2. Community seed profiles use fixed UUIDs (a0000000-0000-0000-0000-000000000001
   through 003) that don't correspond to auth accounts.
*/

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

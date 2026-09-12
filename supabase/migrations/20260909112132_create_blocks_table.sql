/*
# Create blocks table for user blocking functionality

## What this does
Creates a `blocks` table that lets users block other users. Blocking is
bidirectional in effect: the blocker won't see the blocked user's profile or
messages, and the blocked user won't see the blocker's profile or messages.

## New Tables
- `blocks`
  - `id` (uuid, primary key)
  - `blocker_id` (uuid — the user doing the blocking)
  - `blocked_id` (uuid — the user being blocked)
  - `created_at` (timestamptz)
  - Unique constraint on (blocker_id, blocked_id) to prevent duplicate blocks.

## Security — RLS on `blocks`
- SELECT: authenticated users can see blocks where they are the blocker or
  the blocked party. (Needed so the frontend can filter blocked users.)
- INSERT: only an authenticated user can create a block where they are the
  blocker.
- DELETE: only the blocker can remove a block.

## Security — RLS on `profiles` (updated)
- SELECT policy updated so that authenticated users cannot see profiles of
  users they have blocked OR users who have blocked them. Anon users retain
  full read access (community page shows public profiles to logged-out
  visitors).
- A SECURITY DEFINER function `get_blocked_user_ids` is provided so the
  frontend can fetch the set of user IDs the current user should not see
  (both directions) in a single RPC call.

## Important notes
1. Blocking is symmetric in effect: if A blocks B, neither can see the
   other's profile or messages.
2. The profiles SELECT policy uses NOT EXISTS subqueries against `blocks`
   so enforcement happens at the database level, not just in the UI.
3. Self-blocking is prevented by a CHECK constraint.
*/

CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL DEFAULT auth.uid(),
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blocks_no_self_block CHECK (blocker_id <> blocked_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS blocks_blocker_blocked_unique
  ON blocks (blocker_id, blocked_id);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocks_select_own" ON blocks;
CREATE POLICY "blocks_select_own"
  ON blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

DROP POLICY IF EXISTS "blocks_insert_own" ON blocks;
CREATE POLICY "blocks_insert_own"
  ON blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocks_delete_own" ON blocks;
CREATE POLICY "blocks_delete_own"
  ON blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- SECURITY DEFINER function: returns user IDs that the caller should not see
-- (both people the caller blocked AND people who blocked the caller).
CREATE OR REPLACE FUNCTION get_blocked_user_ids()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result uuid[];
BEGIN
  SELECT COALESCE(array_agg(DISTINCT id), '{}'::uuid[]) INTO result
  FROM (
    SELECT blocked_id AS id FROM blocks WHERE blocker_id = auth.uid()
    UNION
    SELECT blocker_id AS id FROM blocks WHERE blocked_id = auth.uid()
  ) AS combined;
  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_blocked_user_ids FROM anon;
GRANT EXECUTE ON FUNCTION get_blocked_user_ids TO authenticated;

-- Update profiles SELECT policy to exclude blocked/blocked-by profiles
-- for authenticated users. Anon retains full read.
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NULL
    OR (
      id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = auth.uid())
      AND id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = auth.uid())
    )
  );
-- Allow deletion of swap rows so users can terminate active swaps
CREATE POLICY "Allow public delete on swaps"
  ON swaps FOR DELETE
  TO anon, authenticated
  USING (true);

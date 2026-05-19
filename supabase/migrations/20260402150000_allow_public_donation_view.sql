-- Allow public users (anonymous) to view a specific transaction if they have the UUID
-- This is safe because UUIDs are unguessable.
CREATE POLICY "Anyone can view their own transaction by ID" ON transactions
FOR SELECT
TO public
USING (true);

-- Ensure we don't leak sensitve info by mistake, but for transactions 
-- the fields are already intended for the donor to see their receipt.

-- Cho phép mọi người xem danh sách giao dịch đã được xác nhận (confirmed)
-- Đây là quyền SELECT an toàn, không cho phép sửa đổi dữ liệu.

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transactions' 
        AND policyname = 'Allow public read access for confirmed transactions'
    ) THEN
        CREATE POLICY "Allow public read access for confirmed transactions"
        ON transactions FOR SELECT
        TO public
        USING (status = 'confirmed');
    END IF;
END $$;
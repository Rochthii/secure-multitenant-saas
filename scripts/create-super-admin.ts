import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperAdmin() {
  const email = 'rochthi59@gmail.com';
  const password = 'Rochthi1609@';

  console.log(`--- Đang khởi tạo tài khoản System Admin: ${email} ---`);

  // 1. Tạo User trong Auth
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { 
        full_name: 'Rochthi System Admin',
        role: 'super_admin'
    }
  });

  let userId: string;

  if (userError) {
    if (userError.message.includes('already registered') || userError.message.includes('already exists')) {
      console.log('Tài khoản đã tồn tại trong Auth, đang lấy ID...');
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      const user = listData?.users.find(u => u.email === email);
      if (!user) {
          console.error('Không tìm thấy user mặc dù báo tồn tại.');
          return;
      }
      userId = user.id;
    } else {
      console.error('Lỗi khi tạo user:', userError.message);
      return;
    }
  } else {
    userId = userData.user!.id;
    console.log('Tạo user thành công:', userId);
  }

  // 2. Gán quyền super_admin trong bảng user_roles
  // Lưu ý: super_admin không thuộc về tenant cụ thể (tenant_id = null)
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role: 'super_admin',
      tenant_id: null 
    }, { onConflict: 'user_id' });

  if (roleError) {
    console.error('Lỗi khi gán quyền:', roleError.message);
    return;
  }

  console.log('--- ĐÃ HOÀN THÀNH: Tài khoản System Admin đã sẵn sàng! ---');
}

createSuperAdmin();

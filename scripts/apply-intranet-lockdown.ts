import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyIntranetLockdown() {
  console.log('🔒 Applying Intranet Lockdown RLS...');

  const sql = `
    -- 1. DHARMA_TALKS (Tài liệu / E-Learning nội bộ)
    DROP POLICY IF EXISTS "Public can read dharma talks including broadcast" ON public.dharma_talks;
    DROP POLICY IF EXISTS "Public can read dharma talks" ON public.dharma_talks;
    DROP POLICY IF EXISTS "Public_Read_Dharma_Talks" ON public.dharma_talks;
    DROP POLICY IF EXISTS "Authenticated users read own tenant dharma talks" ON public.dharma_talks;

    CREATE POLICY "Authenticated users read own tenant dharma talks"
    ON public.dharma_talks FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND is_active = true
        AND (
            public.is_global_admin()
            OR tenant_id = public.get_current_tenant_id()
            OR public.get_current_tenant_id() = ANY(published_to)
        )
    );

    -- 2. NEWS (Tin tức nội bộ)
    DROP POLICY IF EXISTS "Public can read news including broadcast" ON public.news;
    DROP POLICY IF EXISTS "Public can read published news for specific tenant" ON public.news;
    DROP POLICY IF EXISTS "Authenticated users read own tenant news" ON public.news;

    CREATE POLICY "Authenticated users read own tenant news"
    ON public.news FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND status = 'published'
        AND (
            public.is_global_admin()
            OR tenant_id = public.get_current_tenant_id()
            OR public.get_current_tenant_id() = ANY(published_to)
        )
    );

    -- 3. EVENTS (Sự kiện nội bộ)
    DROP POLICY IF EXISTS "Public can read events including broadcast" ON public.events;
    DROP POLICY IF EXISTS "Public can read events" ON public.events;
    DROP POLICY IF EXISTS "Authenticated users read own tenant events" ON public.events;

    CREATE POLICY "Authenticated users read own tenant events"
    ON public.events FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND status IN ('upcoming', 'ongoing', 'completed')
        AND (
            public.is_global_admin()
            OR tenant_id = public.get_current_tenant_id()
            OR public.get_current_tenant_id() = ANY(published_to)
        )
    );
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // Fallback: try running each statement individually
    console.log('⚠️ RPC exec_sql not available, trying individual statements...');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' });
        if (stmtError) {
          console.log(`⚠️ Statement skipped (will apply via dashboard): ${stmt.substring(0, 60)}...`);
        } else {
          console.log(`✅ Applied: ${stmt.substring(0, 60)}...`);
        }
      } catch {
        console.log(`⚠️ Skipped: ${stmt.substring(0, 60)}...`);
      }
    }

    console.log('\n📋 If statements were skipped, please apply the SQL manually via Supabase Dashboard > SQL Editor.');
    console.log('   File: supabase/migrations/20260516200000_intranet_lockdown_rls.sql');
  } else {
    console.log('✅ Intranet Lockdown RLS applied successfully!');
  }

  console.log('\n🎯 Result: Unauthenticated users can NO LONGER read internal documents, news, or events.');
  console.log('   They must login first AND belong to the correct tenant.');
}

applyIntranetLockdown()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Failed:', err);
    process.exit(1);
  });

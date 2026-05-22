import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isGlobalAdmin } from '@/lib/permissions';
import { AnalyticsClient } from './analytics-client';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    // SECURITY: Chỉ Super Admin hoặc các role hệ thống cấp cao mới xem được Analytics toàn cục
    const globalAccess = await isGlobalAdmin();
    if (!globalAccess) {
        redirect('/admin');
    }

    const supabase = await createClient();

    // Thực hiện truy vấn song song dữ liệu thực tế từ cơ sở dữ liệu
    const [
        tenantsRes,
        newsRes,
        eventsRes,
        regsRes,
        usersRes,
        auditLogsRes
    ] = await Promise.all([
        (supabase as any).from('tenants').select('id, name, domain, tenant_type, created_at'),
        supabase.from('news').select('id, tenant_id, created_at'),
        supabase.from('events').select('id, tenant_id, created_at'),
        supabase.from('event_registrations').select('id, tenant_id, created_at'),
        (supabase as any).from('user_roles').select('id', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('id', { count: 'exact', head: true })
    ]);

    const tenants = (tenantsRes.data || []).map((t: any) => ({
        id: t.id,
        name: t.name || 'Không tên',
        domain: t.domain || 'Chưa cấu hình',
        tenant_type: t.tenant_type || 'tenant',
        created_at: t.created_at || ''
    }));

    const news = (newsRes.data || []).map(n => ({
        id: n.id,
        tenant_id: n.tenant_id || '',
        created_at: n.created_at || ''
    }));

    const events = (eventsRes.data || []).map(e => ({
        id: e.id,
        tenant_id: e.tenant_id || '',
        created_at: e.created_at || ''
    }));

    const eventRegs = (regsRes.data || []).map(r => ({
        id: r.id,
        tenant_id: r.tenant_id || '',
        created_at: r.created_at || ''
    }));

    const totalUsers = usersRes.count || 0;
    const auditCount = auditLogsRes.count || 0;

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Premium Command Center Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -mr-64 -mt-64 mix-blend-screen pointer-events-none" />
                
                <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 bg-clip-text text-transparent tracking-tight">Analytics Hệ thống</h1>
                            <p className="text-slate-400 mt-2 text-xs italic">
                                * Số liệu thống kê lưu lượng và tương tác trực quan thời gian thực từ các chi nhánh và cơ sở dữ liệu.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client analytics client logic */}
            <AnalyticsClient
                tenants={tenants}
                news={news}
                events={events}
                eventRegs={eventRegs}
                totalUsers={totalUsers}
                auditCount={auditCount}
            />
        </div>
    );
}


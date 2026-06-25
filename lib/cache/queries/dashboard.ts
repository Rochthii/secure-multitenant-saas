import { createClient } from '@/lib/supabase/server';

export const getAdminDashboardStats = async (tenantId: string) => {
    const supabase = await createClient();

    const [
        { count: newsCount },
        { count: eventsCount },
        { count: registrationsCount },
        { count: auditLogsCount },
        { data: recentNews },
        { data: recentRegistrations },
        { data: recentAuditLogs },
    ] = await Promise.all([
        supabase.from('news').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('event_registrations')
            .select('*, events!inner(id)', { count: 'exact', head: true })
            .eq('events.tenant_id', tenantId),
        supabase.from('audit_logs').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('news')
            .select('id, title_vi, created_at, status')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(5),
        supabase.from('event_registrations')
            .select('id, full_name, email, status, created_at, events!inner(title_vi, tenant_id)')
            .eq('events.tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(5),
        supabase.from('audit_logs')
            .select('id, action, table_name, user_email, created_at, ip_address')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(5),
    ]);

    return {
        newsCount: newsCount || 0,
        eventsCount: eventsCount || 0,
        pendingRegistrations: registrationsCount || 0,
        auditLogsCount: auditLogsCount || 0,
        recentNews: recentNews || [],
        recentRegistrations: recentRegistrations || [],
        recentAuditLogs: recentAuditLogs || [],
        projectsCount: 0,
        totalTransactions: 0,
        recentTransactions: [],
        transactions: [],
        transactionSummary: null,
    };
};

export const getGlobalDashboardStats = async () => {
    const supabase = await createClient();
    
    const [
        { data: newsData },
        { data: eventsData },
        { data: tenantsAll },
        { data: transactions },
        { data: registrations },
        { data: recentTenants },
    ] = await Promise.all([
        supabase.from('news').select('id, tenant_id'),
        supabase.from('events').select('id, tenant_id'),
        supabase.from('tenants' as any).select('id, name, domain, plan_type, lifecycle_status, tenant_type, modules_config, created_at'),
        supabase.from('transactions').select('amount, status, tenant_id, created_at'),
        supabase.from('event_registrations').select('id, status, tenant_id, created_at'),
        supabase.from('tenants' as any).select('id, name, domain, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    const confirmedTransactions = (transactions || []).filter(d => d.status === 'confirmed');
    const totalVolume = confirmedTransactions.reduce((sum, d) => sum + (d.amount || 0), 0);

    const tenantStats = (transactions || []).reduce((acc: any, d) => {
        const tid = d.tenant_id || 'unassigned';
        if (!acc[tid]) acc[tid] = { count: 0, total: 0 };
        acc[tid].count++;
        if (d.status === 'confirmed') acc[tid].total += d.amount || 0;
        return acc;
    }, {});

    const planDistribution = {
        free: { active: 0, trial: 0, suspended: 0 },
        pro: { active: 0, trial: 0, suspended: 0 },
        enterprise: { active: 0, trial: 0, suspended: 0 }
    };

    (tenantsAll || []).forEach((t: any) => {
        const plan = (t.plan_type || 'free').toLowerCase() as 'free' | 'pro' | 'enterprise';
        const status = (t.lifecycle_status || 'active').toLowerCase() as 'active' | 'trial' | 'suspended';
        
        if (planDistribution[plan]) {
            if (status === 'active') planDistribution[plan].active++;
            else if (status === 'trial') planDistribution[plan].trial++;
            else if (status === 'suspended') planDistribution[plan].suspended++;
        }
    });

    const planChartData = [
        { name: 'Gói Free', active: planDistribution.free.active, trial: planDistribution.free.trial, suspended: planDistribution.free.suspended },
        { name: 'Gói Pro', active: planDistribution.pro.active, trial: planDistribution.pro.trial, suspended: planDistribution.pro.suspended },
        { name: 'Gói Enterprise', active: planDistribution.enterprise.active, trial: planDistribution.enterprise.trial, suspended: planDistribution.enterprise.suspended },
    ];

    const moduleAdoption = {
        news: 0,
        events: 0,
        donations: 0,
        custom_domain: 0,
    };

    (tenantsAll || []).forEach((t: any) => {
        let config: any = {};
        if (t.modules_config) {
            try {
                config = typeof t.modules_config === 'string' 
                    ? JSON.parse(t.modules_config) 
                    : t.modules_config;
            } catch (e) {
                config = {};
            }
        }
        
        if (config.news !== false) moduleAdoption.news++;
        if (config.events !== false) moduleAdoption.events++;
        if (config.donations === true) moduleAdoption.donations++;
        
        if (t.domain && !t.domain.includes('vercel.app') && !t.domain.includes('localhost')) {
            moduleAdoption.custom_domain++;
        }
    });

    const totalTenantsCount = tenantsAll?.length || 0;
    const featureChartData = [
        { name: 'Tin tức & Ấn bản', value: moduleAdoption.news, percentage: totalTenantsCount > 0 ? Math.round((moduleAdoption.news / totalTenantsCount) * 100) : 0 },
        { name: 'Sự kiện & Hội thảo', value: moduleAdoption.events, percentage: totalTenantsCount > 0 ? Math.round((moduleAdoption.events / totalTenantsCount) * 100) : 0 },
        { name: 'Cổng Quyên góp', value: moduleAdoption.donations, percentage: totalTenantsCount > 0 ? Math.round((moduleAdoption.donations / totalTenantsCount) * 100) : 0 },
        { name: 'Tên miền Custom', value: moduleAdoption.custom_domain, percentage: totalTenantsCount > 0 ? Math.round((moduleAdoption.custom_domain / totalTenantsCount) * 100) : 0 },
    ];

    const resourceChartData = (tenantsAll || []).map((t: any) => {
        const tid = t.id;
        const nCount = (newsData || []).filter((n: any) => n.tenant_id === tid).length;
        const eCount = (eventsData || []).filter((e: any) => e.tenant_id === tid).length;
        const rCount = (registrations || []).filter((r: any) => r.tenant_id === tid).length;
        return {
            name: t.name.length > 15 ? t.name.substring(0, 15) + '...' : t.name,
            'Tin tức': nCount,
            'Sự kiện': eCount,
            'Khách hàng': rCount,
            total: nCount + eCount + rCount
        };
    }).sort((a, b) => b.total - a.total).slice(0, 5);

    const typeBreakdown = {
        enterprise: (tenantsAll || []).filter((t: any) => t.tenant_type !== 'tenant').length,
        legacy: (tenantsAll || []).filter((t: any) => t.tenant_type === 'tenant').length,
    };

    return {
        newsCount: newsData?.length || 0,
        eventsCount: eventsData?.length || 0,
        tenantsCount: totalTenantsCount,
        totalVolume,
        pendingRegistrations: (registrations || []).filter(r => r.status === 'pending').length,
        recentTenants: recentTenants || [],
        tenantStats,
        recentTransactions: (transactions || []).slice(0, 5),
        planChartData,
        featureChartData,
        resourceChartData,
        typeBreakdown,
    };
};

import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { TransactionPurpose } from '@/lib/constants/transaction';

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

export type TransactionProjectUI = {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    goal: number;
    current: number;
    color: string;
    is_active: boolean;
    order_position: number;
    recipient_type: 'tenant_fund' | 'charity_fund';
    bank_account_id?: string;
    tenant_id: string;
    type: 'general_fund' | 'specific_project';
    slug?: string | null;
};

// Cache transaction projects for 1 hour
export const getTransactionProjects = (tenantId?: string): Promise<TransactionProjectUI[]> => {
    return unstable_cache(
        async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            let projectsQ = supabase
                .from('transaction_projects')
                .select('*')
                .eq('is_active', true)
                .in('status', ['ongoing', 'completed']) // Include completed if we want to show history, otherwise just ongoing. But legacy purpose didn't have status. We will stick to ongoing.
                .order('created_at', { ascending: true }); // We don't have order_position anymore, ordered by created_at

            let transactionsQ = supabase
                .from('transactions')
                .select('project_id, amount')
                .eq('status', 'confirmed');

            const { data: companyRecord } = await supabase.from('tenants').select('id').eq('tenant_type', 'company').limit(1).maybeSingle();
            const companyId = companyRecord?.id;

            if (tenantId) {
                // Mỗi chi nhánh thấy: project của chính họ + Global Admin (Company)
                if (companyId) {
                    projectsQ = projectsQ.or(`tenant_id.eq.${tenantId},tenant_id.eq.${companyId}`);
                } else {
                    projectsQ = projectsQ.eq('tenant_id', tenantId);
                }
                transactionsQ = transactionsQ.eq('tenant_id', tenantId);
            }

            // Fetch projects and confirmed transaction sums in parallel
            const [projectsRes, transactionsRes] = await Promise.all([
                projectsQ,
                transactionsQ
            ]);

            const projectsData = projectsRes.data || [];
            const transactionsData = transactionsRes.data || [];

            // Build a map of totals by project ID
            const totalsMap: Record<string, number> = {};
            transactionsData.forEach((d: any) => {
                if (d.project_id) {
                    totalsMap[d.project_id] = (totalsMap[d.project_id] || 0) + d.amount;
                }
            });

            // Map projects for UI
            const mappedProjects: TransactionProjectUI[] = projectsData.map((project: any, index: number) => ({
                id: project.id,
                title: project.title_vi,
                description: project.description_vi,
                icon: project.type === 'general_fund' ? 'Heart' : 'Building2',
                goal: project.target_amount || 0,
                current: totalsMap[project.id] || 0,
                color: project.type === 'general_fund' ? 'text-amber-500' : 'text-gold-primary',
                is_active: project.is_active,
                order_position: index, // Temporary order
                recipient_type: project.type === 'general_fund' ? 'tenant_fund' : 'charity_fund',
                bank_account_id: project.bank_account_id,
                tenant_id: project.tenant_id,
                type: project.type,
                slug: project.slug,
            }));

            return mappedProjects;
        },
        ['transaction-projects-v3', tenantId || 'all'],
        {
            revalidate: 3600,
            tags: [
                'transaction-projects',
                'confirmed-transactions',
                tenantId ? `transaction-projects-${tenantId}` : 'transaction-projects-all',
            ]
        }
    )();
};

export async function getTransactionPurpose(id: string, tenantId?: string): Promise<TransactionPurpose | null> {
    const purposes = await getTransactionProjects(tenantId);
    return purposes.find((p) => p.id === id) || null;
}

export interface RecentTransaction {
    id: string;
    donor_name: string;
    amount: number;
    project_id: string;
    is_anonymous: boolean;
    created_at: string;
}

// Cache recent transactions for 5 minutes
export const getRecentTransactions = (limit = 10, tenantId?: string): Promise<RecentTransaction[]> => {
    return unstable_cache(
        async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            let q = supabase
                .from('transactions')
                .select('id, donor_name, amount, project_id, is_anonymous, created_at')
                .eq('status', 'confirmed');

            if (tenantId) {
                q = q.eq('tenant_id', tenantId);
            }

            const { data, error } = await q
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching recent transactions:', error);
                return [];
            }

            return data as RecentTransaction[];
        },
        ['recent-transactions-v2', limit.toString(), tenantId || 'all'],
        {
            revalidate: 300,
            tags: [
                'recent-transactions',
                tenantId ? `recent-transactions-${tenantId}` : 'recent-transactions-all'
            ]
        }
    )();
};

/**
 * Generates a structured transfer content string for VietQR.
 * Format: MC [FUND_KEY] [TENANT_KEY] [PURPOSE_KEY] [ID] [NAME]
 */
export function generateTransferContent({
    donorName,
    isAnonymous,
    fundKey,
    tenantKey,
    purposeKey,
    shortId,
}: {
    donorName?: string;
    isAnonymous?: boolean;
    fundKey: 'CD' | 'TT';
    tenantKey: string;
    purposeKey: string;
    shortId: string;
}): string {
    const cleanName = donorName && !isAnonymous 
        ? removeAccents(donorName).toUpperCase().replace(/[^A-Z ]/g, '').trim().substring(0, 15)
        : 'AN DANH';
    
    // Ensure keys are clean
    const tKey = tenantKey.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4);
    const pKey = purposeKey.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4);
    
    return `MC ${fundKey} ${tKey} ${pKey} ${shortId} ${cleanName}`.trim().substring(0, 50);
}

// Utility to remove accents for banking transfer
export function removeAccents(str: string): string {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}


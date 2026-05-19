-- Create organizations table for Social Enterprise entities
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    org_type TEXT DEFAULT 'partner', -- 'enterprise', 'ngo', 'partner'
    description TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Governance Policies
CREATE POLICY "Enable read access for all users" ON public.organizations
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users with admin role" ON public.organizations
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        (public.is_global_admin() OR public.get_current_tenant_id() = tenant_id)
    );

CREATE POLICY "Enable update for authenticated users with admin role" ON public.organizations
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND
        (public.is_global_admin() OR public.get_current_tenant_id() = tenant_id)
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        (public.is_global_admin() OR public.get_current_tenant_id() = tenant_id)
    );

CREATE POLICY "Enable delete for super_admins only" ON public.organizations
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND
        public.is_global_admin()
    );

-- Trigger for updated_at
CREATE TRIGGER set_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add index
CREATE INDEX IF NOT EXISTS idx_organizations_tenant_id ON public.organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON public.organizations(is_active);

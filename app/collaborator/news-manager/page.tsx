import React from 'react';
import { requireVolunteer } from '@/lib/auth/require-admin';
import { createClient } from '@/lib/supabase/server';
import { NewsListView } from '@/components/admin/news-list-view';

interface VolunteerNewsListPageProps {
    searchParams?: any;
}

export default async function VolunteerNewsListPage({ searchParams }: VolunteerNewsListPageProps) {
    const user = await requireVolunteer();
    const supabase = await createClient();

    return (
        <NewsListView
            searchParams={searchParams}
            basePath="/collaborator/news-manager"
            isCollaborator={true}
            userId={user.id}
            dbClient={supabase}
        />
    );
}

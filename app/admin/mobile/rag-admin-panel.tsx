'use client';

import React from 'react';
import { useRagAdmin } from '@/hooks/use-rag-admin';
import { RagOverview } from './rag-overview';
import { RagDocumentManager } from './rag-document-manager';
import { RagCategoryManager } from './rag-category-manager';
import RagUploader from './rag-uploader';
import {
    BarChart3, BookOpen, Upload, Tags, LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarSection = 'overview' | 'documents' | 'categories' | 'upload';

const NAV_ITEMS: { key: SidebarSection; label: string; icon: React.ElementType }[] = [
    { key: 'overview',    label: 'Tổng quan',         icon: LayoutDashboard },
    { key: 'documents',   label: 'Kho Kinh điển',     icon: BookOpen },
    { key: 'categories',  label: 'Chuyên đề',          icon: Tags },
    { key: 'upload',      label: 'Nạp Kinh sách',      icon: Upload },
];

export function RagAdminPanel() {
    const [activeSection, setActiveSection] = React.useState<SidebarSection>('overview');
    const ragAdmin = useRagAdmin();

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <RagOverview ragAdmin={ragAdmin} />;
            case 'documents':
                return <RagDocumentManager ragAdmin={ragAdmin} />;
            case 'categories':
                return <RagCategoryManager ragAdmin={ragAdmin} />;
            case 'upload':
                return (
                    <RagUploader onUploadComplete={ragAdmin.refetchAll} />
                );
        }
    };

    return (
        <div className="flex gap-6 min-h-[600px]">
            {/* ── Sidebar ── */}
            <aside className="w-52 shrink-0">
                <nav className="space-y-1">
                    {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                        const isActive = activeSection === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveSection(key)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-purple-50 text-purple-700 shadow-sm border border-purple-100"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-purple-600" : "text-gray-400")} />
                                {label}
                            </button>
                        );
                    })}
                </nav>

                {/* Stats tóm tắt sidebar */}
                {ragAdmin.stats && (
                    <div className="mt-6 p-3 bg-gray-50 rounded-lg space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                            <span>Tài liệu</span>
                            <span className="font-semibold text-gray-700">{ragAdmin.stats.total_documents}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Vectors</span>
                            <span className="font-semibold text-gray-700">{ragAdmin.stats.total_vectors.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Chuyên đề</span>
                            <span className="font-semibold text-gray-700">{ragAdmin.stats.total_categories}</span>
                        </div>
                    </div>
                )}
            </aside>

            {/* ── Content ── */}
            <main className="flex-1 min-w-0">
                {renderContent()}
            </main>
        </div>
    );
}

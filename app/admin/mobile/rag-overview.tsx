'use client';

import React from 'react';
import { Loader2, Database, FileText, BookOpen, BarChart2 } from 'lucide-react';

interface Props { ragAdmin: ReturnType<typeof import('@/hooks/use-rag-admin').useRagAdmin> }

export function RagOverview({ ragAdmin }: Props) {
    const { stats, isLoadingStats } = ragAdmin;

    const statCards = [
        {
            label: "Tổng tài liệu",
            value: stats?.total_documents ?? 0,
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Vector Embeddings",
            value: stats?.total_vectors.toLocaleString() ?? 0,
            icon: Database,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            label: "Chuyên đề Phật học",
            value: stats?.total_categories ?? 0,
            icon: BookOpen,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Tổng quan Hệ thống RAG</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Kiến trúc tri thức của Sư Số — Người Thầy Số.
                </p>
            </div>

            {/* ── Stat cards ── */}
            {isLoadingStats ? (
                <div className="flex items-center gap-2 text-gray-400 py-8">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tải thống kê...
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="rounded-xl border bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`${bg} p-2 rounded-lg`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{label}</p>
                                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Phân bố theo chuyên đề ── */}
            {stats && stats.category_distribution.length > 0 && (
                <div className="rounded-xl border bg-white p-4 space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                        <BarChart2 className="w-4 h-4 text-purple-500" /> Phân bố tài liệu theo Chuyên đề
                    </h3>
                    <div className="space-y-2">
                        {stats.category_distribution
                            .filter(c => c.count > 0)
                            .map(cat => {
                                const maxCount = Math.max(...stats.category_distribution.map(c => c.count));
                                const pct = maxCount > 0 ? Math.round((cat.count / maxCount) * 100) : 0;
                                return (
                                    <div key={cat.id} className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span className="truncate max-w-[200px]">{cat.name}</span>
                                            <span className="font-medium ml-2">{cat.count} tài liệu</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-400 rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}

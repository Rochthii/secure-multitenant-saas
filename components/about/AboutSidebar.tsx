import React from 'react';
import { getCachedAboutSections, type AboutSectionRow } from '@/lib/cache/queries';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ChevronRight, ShieldCheck } from 'lucide-react';

export default async function AboutSidebar({
    activeKey,
    tenantId,
    sections: propSections
}: {
    activeKey: string,
    tenantId: string,
    sections?: AboutSectionRow[]
}) {
    const sections = propSections || (await getCachedAboutSections(tenantId)) || [];

    // Lấy các menu gốc (không chứa dấu '/')
    const rootSections = sections.filter(s => !s.key.includes('/'));

    const renderNode = (node: any, level: number = 0) => {
        const isActive = activeKey === node.key || activeKey.startsWith(`${node.key}/`);
        const isExactMatch = activeKey === node.key;

        // Cấp bậc thụt lề
        const paddingLeft = level === 0 ? "px-4" : level === 1 ? "pl-8 pr-4" : "pl-12 pr-4";

        return (
            <div key={node.key} className="flex flex-col">
                <Link
                    href={`/gioi-thieu/${node.key}`}
                    className={cn(
                        "flex items-center justify-between py-3 rounded-xl text-[15px] transition-all duration-300 relative group overflow-hidden",
                        paddingLeft,
                        isExactMatch
                            ? "bg-gold-primary/10 text-coffee-dark font-bold shadow-sm"
                            : "text-gray-600 hover:bg-stone-50 hover:text-coffee-dark font-medium"
                    )}
                >
                    {/* Active Background Slide */}
                    {isExactMatch && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gold-primary/5 to-transparent pointer-events-none"></div>
                    )}

                    {/* Active/Hierarchy Indicator */}
                    <div className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 flex items-center justify-center",
                        isExactMatch ? "opacity-100 scale-100" : "opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-75"
                    )}>
                        <svg className="w-3 h-3 text-gold-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15 12L22 15L15 18L12 24L9 18L2 15L9 12L12 2Z" />
                        </svg>
                    </div>

                    <span className={cn(
                        "truncate flex-1 transition-transform duration-300",
                        (isExactMatch || level > 0) ? "translate-x-3" : "group-hover:translate-x-2"
                    )}>
                        {node.title_vi}
                    </span>

                    {node.children && node.children.length > 0 && (
                        <ChevronRight className={cn(
                            "w-4 h-4 transition-transform duration-300 ml-2",
                            isActive ? "text-gold-primary rotate-90" : "text-gray-300 group-hover:text-gold-primary/50"
                        )} />
                    )}
                </Link>

                {/* Render Recursive Children (Chỉ mở ra nếu nhánh cha/con báo active) */}
                {node.children && node.children.length > 0 && (isActive || isExactMatch) && (
                    <div className="flex flex-col mt-1 mb-2 space-y-1 border-l-2 border-gold-primary/10 ml-6">
                        {node.children.map((child: any) => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Chuẩn bị dữ liệu Tree giống Header
    const buildSidebarTree = () => {
        const treeMap: Record<string, any> = {};
        const rootNodes: any[] = [];

        // Lọc bỏ các mục ẩn
        const activeSections = sections.filter(s => s.is_active !== false);

        activeSections.forEach(sec => {
            treeMap[sec.key] = { ...sec, children: [] };
        });

        activeSections.forEach(sec => {
            const parts = sec.key.split('/');
            if (parts.length > 1) {
                const parentKey = parts.slice(0, -1).join('/');
                if (treeMap[parentKey]) {
                    treeMap[parentKey].children.push(treeMap[sec.key]);
                } else {
                    rootNodes.push(treeMap[sec.key]);
                }
            } else {
                rootNodes.push(treeMap[sec.key]);
            }
        });

        // Sắp xếp theo display_order
        const sortNodes = (nodes: any[]) => {
            nodes.sort((a, b) => (a.display_order || 99) - (b.display_order || 99));
            nodes.forEach(node => {
                if (node.children?.length > 0) sortNodes(node.children);
            });
        };
        sortNodes(rootNodes);

        return rootNodes;
    };

    const sidebarTree = buildSidebarTree();

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden relative group transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            {/* Elegant Header */}
            <div className="bg-gradient-to-br from-coffee-dark to-[#3A2218] px-6 py-6 relative overflow-hidden">
                {/* Subtle top glow */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary/50 to-transparent"></div>
                {/* Decorative background circle */}
                <div className="absolute -top-12 -right-12 w-32 h-32 border border-gold-primary/10 rounded-full opacity-50"></div>
                <div className="absolute -top-6 -right-6 w-16 h-16 border border-gold-primary/20 rounded-full opacity-50"></div>

                <h3 className="text-gold-light font-playfair font-bold text-lg tracking-[0.15em] uppercase text-center relative z-10 drop-shadow-sm">
                    Mục Lục
                </h3>
            </div>

            {/* Navigation Body */}
            <nav className="p-3 flex flex-col gap-1 relative z-10">
                {sidebarTree.length > 0 ? (
                    sidebarTree.map((root: any) => renderNode(root))
                ) : (
                    <div className="p-4 text-center text-sm text-gray-500 italic font-playfair">
                        Chưa có mục lục
                    </div>
                )}
            </nav>

            {/* Glass reflection effect */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-transparent"></div>
        </div>
    );
}

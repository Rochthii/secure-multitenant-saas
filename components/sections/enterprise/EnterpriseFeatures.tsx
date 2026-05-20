'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { Network, Fingerprint, LayoutDashboard, Globe } from 'lucide-react';

const FEATURES = [
    {
        title: 'Bảo mật Cấp Doanh nghiệp',
        description: 'Tích hợp xác thực đa yếu tố, phân quyền chặt chẽ RBAC, và mã hóa dữ liệu đầu cuối. Đạt chuẩn ISO 27001.',
        icon: Fingerprint,
        colSpan: 'md:col-span-2 lg:col-span-2',
        rowSpan: 'row-span-1',
        bg: 'bg-indigo-500/5',
        border: 'border-indigo-500/10'
    },
    {
        title: 'Mạng lưới Đa chi nhánh',
        description: 'Quản lý tập trung hàng trăm chi nhánh, tối ưu hóa nguồn lực và dòng thông tin thông suốt.',
        icon: Network,
        colSpan: 'md:col-span-1 lg:col-span-1',
        rowSpan: 'row-span-1',
        bg: 'bg-emerald-500/5',
        border: 'border-emerald-500/10'
    },
    {
        title: 'Dashboard Thông minh',
        description: 'Báo cáo thời gian thực, analytics chuyên sâu với giao diện trực quan.',
        icon: LayoutDashboard,
        colSpan: 'md:col-span-1 lg:col-span-1',
        rowSpan: 'row-span-1',
        bg: 'bg-fuchsia-500/5',
        border: 'border-fuchsia-500/10'
    },
    {
        title: 'Hạ tầng Toàn cầu',
        description: 'Triển khai trên Edge Network, mang lại tốc độ load siêu tốc bất kể người dùng ở đâu.',
        icon: Globe,
        colSpan: 'md:col-span-2 lg:col-span-2',
        rowSpan: 'row-span-1',
        bg: 'bg-blue-500/5',
        border: 'border-blue-500/10'
    },
];

export function EnterpriseFeatures({ data }: { data?: BlockConfig }) {
    return (
        <section className="py-24 bg-[#0A0F1A] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            
            <div className="container px-4 mx-auto max-w-6xl relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight"
                    >
                        Được thiết kế cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Quy mô lớn</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg"
                    >
                        Cung cấp đầy đủ các tính năng mạnh mẽ để tổ chức của bạn vận hành trơn tru và phát triển bền vững trên môi trường số.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feat, idx) => {
                        const Icon = feat.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className={`group p-8 rounded-3xl border backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800/50 ${feat.colSpan} ${feat.rowSpan} ${feat.bg} ${feat.border}`}
                            >
                                <div className="w-12 h-12 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                    <Icon className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{feat.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-medium text-sm md:text-base">
                                    {feat.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default EnterpriseFeatures;

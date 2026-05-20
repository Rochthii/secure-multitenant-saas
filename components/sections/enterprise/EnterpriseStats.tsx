'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { type BlockConfig } from '@/lib/types/layout-blocks';
import { Users, Database, Shield, Zap } from 'lucide-react';

const STATS = [
    { label: 'Người dùng tích cực', value: '10,000+', icon: Users },
    { label: 'Dữ liệu được xử lý', value: '500TB', icon: Database },
    { label: 'Thời gian Uptime', value: '99.99%', icon: Zap },
    { label: 'Tuân thủ bảo mật', value: 'ISO 27001', icon: Shield },
];

export function EnterpriseStats({ data }: { data?: BlockConfig }) {
    return (
        <section className="py-20 bg-slate-900 border-t border-slate-800">
            <div className="container px-4 mx-auto max-w-6xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 mb-4 shadow-inner">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</h3>
                                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default EnterpriseStats;

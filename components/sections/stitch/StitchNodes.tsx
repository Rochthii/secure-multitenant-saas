'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { BookOpen, HelpCircle } from 'lucide-react';

interface DharmaNode {
  id: string;
  title: string;
  slug: string;
  category?: string;
  thumbnail?: string;
}

interface StitchNodesProps {
  dharmaTalks?: DharmaNode[];
  title?: string;
}

export const StitchNodes: React.FC<StitchNodesProps> = ({
  dharmaTalks = [],
  title = "Các Phân Hệ Quản Trị & Tư Liệu Số"
}) => {
  const displayTalks = dharmaTalks.slice(0, 6);

  return (
    <section id="nodes" className="py-28 bg-[#070A0F] border-t border-white/5 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00F2FF]/3 blur-[160px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-5 uppercase">
              {title}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] border-l-2 border-[#00F2FF] pl-4 leading-none">
              Hệ thống website động và tư liệu truyền thông số hóa bảo mật
            </p>
          </div>
          
          <Link 
            href="/documents"
            className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-widest uppercase text-[#00F2FF] hover:bg-[#00F2FF]/10 px-6 py-3 border border-[#00F2FF]/30 hover:border-[#00F2FF]/80 rounded-xl transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Xem Tài Liệu Hệ Thống
          </Link>
        </div>

        {/* 3D Grid of Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTalks.map((talk, idx) => (
            <motion.div
              key={talk.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              className="group relative"
            >
              {/* Card Ambient Glow Behind */}
              <div className="absolute inset-0 bg-[#00F2FF]/5 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 pointer-events-none" />

              <Link href={`/documents/${talk.slug}`} className="block">
                <div className="relative p-8 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] hover:border-[#00F2FF]/40 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-2xl">
                  
                  {/* Fine Digital Top Accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-[#00F2FF] rounded-full animate-pulse shadow-[0_0_10px_#00F2FF]" />
                    <div className="absolute top-5 right-5 w-8 h-[1px] bg-[#00F2FF]/30 -rotate-45 origin-right" />
                  </div>

                  <div className="mb-6">
                    <span className="text-[10px] font-extrabold tracking-widest text-[#00F2FF]/60 uppercase">
                      Mã tài liệu: #{talk.id.substring(0, 8).toUpperCase()}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-3 group-hover:text-[#00F2FF] transition-colors line-clamp-2 leading-snug">
                      {talk.title}
                    </h3>
                  </div>

                  {/* Card Bottom Indicator */}
                  <div className="flex items-center justify-between mt-12 border-t border-white/5 pt-4">
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-1 h-1 bg-[#00F2FF]/20 rounded-full" />
                      ))}
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wider text-slate-500 group-hover:text-white transition-colors">
                      XEM CHI TIẾT →
                    </span>
                  </div>

                  {/* Glowing bottom line sliding up */}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00F2FF] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Empty Placeholder Card with dash border */}
          <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-white/[0.005] border border-dashed border-white/10 hover:border-white/20 rounded-2xl opacity-40 hover:opacity-60 transition-opacity duration-300">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center mb-4 text-slate-400">
              <span className="text-xl leading-none">+</span>
            </div>
            <p className="text-[10px] font-extrabold tracking-widest uppercase text-center text-slate-500">
              Phân Hệ Mới<br/>Đang Đồng Bộ
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

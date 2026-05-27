'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { CalendarRange, ArrowUpRight } from 'lucide-react';

interface StitchEventsProps {
  upcomingEvents?: any[];
  title?: string;
}

export const StitchEvents: React.FC<StitchEventsProps> = ({
  upcomingEvents = [],
  title = "Lịch Trình Sự Kiện & Hoạt Động Doanh Nghiệp"
}) => {
  const displayEvents = upcomingEvents.slice(0, 4);

  return (
    <section className="py-28 bg-[#070A0F] relative overflow-hidden">
      {/* Soft Ambient Light Bottom Left */}
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        {/* Title Bar with Pulse Ring */}
        <div className="flex items-center gap-4.5 mb-16">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2FF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00F2FF] shadow-[0_0_10px_#00F2FF]"></span>
          </div>
          <h2 className="text-2xl font-black tracking-widest uppercase text-white">
            {title}
          </h2>
        </div>

        {/* Timeline Rows */}
        <div className="space-y-4">
          {displayEvents.length > 0 ? (
            displayEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative"
              >
                <Link href={`/lich-le/${event.slug || event.id}`} className="block">
                  {/* Row Outer Glow Container */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] hover:border-[#00F2FF]/30 transition-all duration-300 rounded-2xl gap-6">
                    
                    <div className="flex items-center gap-6">
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center w-16 h-16 border border-white/10 rounded-xl bg-[#0F1622] group-hover:border-[#00F2FF]/40 transition-colors duration-300">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-tighter mb-0.5">Ngày / Tg</span>
                        <span className="text-xl font-black text-white tabular-nums">
                          {new Date(event.start_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#00F2FF] transition-colors duration-300 leading-tight">
                          {event.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2.5">
                          📍 {event.location || 'Hệ Thống Trung Ương'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-center gap-4">
                      <div className="px-3 py-1.5 bg-white/5 text-[9px] font-black tracking-widest uppercase rounded-lg border border-white/10 text-slate-400 group-hover:text-white group-hover:border-white/20 transition-all">
                        HOẠT ĐỘNG
                      </div>
                      <div className="w-9 h-9 border border-white/10 group-hover:border-[#00F2FF]/40 group-hover:bg-[#00F2FF]/5 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:translate-x-1">
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#00F2FF] transition-colors" />
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl opacity-40 bg-white/[0.003]">
              <span className="text-[10px] font-extrabold tracking-[0.4em] uppercase text-white/50">
                Đang quét lịch trình vận hành doanh nghiệp...
              </span>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center">
            <Link 
              href="/lich-le"
              className="inline-flex items-center gap-2.5 px-10 py-3.5 text-[10px] font-extrabold tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 text-slate-400 hover:text-white rounded-full transition-all duration-300"
            >
              <CalendarRange className="w-4 h-4" />
              Xem Lịch Trình Chi Tiết
            </Link>
        </div>
      </div>
    </section>
  );
};

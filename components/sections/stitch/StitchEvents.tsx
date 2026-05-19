'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';

interface StitchEventsProps {
  upcomingEvents?: any[];
  title?: string;
}

export const StitchEvents: React.FC<StitchEventsProps> = ({
  upcomingEvents = [],
  title = "Upcoming Protocol Events"
}) => {
  const displayEvents = upcomingEvents.slice(0, 4);

  return (
    <section className="py-24 bg-[#0A0F14] relative border-b border-white/5">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-3 h-3 bg-[#00F2FF] shadow-[0_0_10px_#00F2FF] animate-ping" />
          <h2 className="text-2xl font-black tracking-widest uppercase text-white">
            {title}
          </h2>
        </div>

        <div className="space-y-4">
          {displayEvents.length > 0 ? (
            displayEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <Link href={`/lich-le/${event.slug || event.id}`} className="block">
                  <div className="flex items-center justify-between p-6 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-[#00F2FF]/30 transition-all rounded-xl">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center w-16 h-16 border border-white/10 rounded font-black">
                        <span className="text-[10px] text-slate-500 uppercase tracking-tighter">MO/DY</span>
                        <span className="text-xl text-white">
                          {new Date(event.start_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#00F2FF] transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                          Location_ID: {event.location || 'Global Stream'}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                      <div className="px-3 py-1 bg-white/5 text-[10px] font-black tracking-widest uppercase rounded border border-white/10">
                        OPEN_STAGE
                      </div>
                      <svg className="w-5 h-5 text-slate-600 group-hover:text-[#00F2FF] transition-all transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl opacity-40">
              <span className="text-[10px] font-black tracking-[0.5em] uppercase text-white">
                Scanning for Events... Zero Matches
              </span>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
            <Link 
              href="/lich-le"
              className="inline-block px-10 py-3 text-[10px] font-black tracking-[0.3em] uppercase border border-white/10 hover:border-white/30 text-slate-400 hover:text-white rounded-full transition-all"
            >
              Full Calendar Initialization
            </Link>
        </div>
      </div>
    </section>
  );
};

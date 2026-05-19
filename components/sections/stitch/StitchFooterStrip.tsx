'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';

interface StitchFooterStripProps {
  settings?: Record<string, string>;
}

export const StitchFooterStrip: React.FC<StitchFooterStripProps> = ({ settings = {} }) => {
  return (
    <section className="py-16 bg-[#05080A] border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-center">
          
          <div className="space-y-4">
            <h4 className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-600">
              Contact Terminal
            </h4>
            <div className="space-y-2 text-sm font-medium">
              <p className="text-white hover:text-[#00F2FF] transition-colors cursor-pointer">
                T: {settings['contact_phone'] || '+84 28 1234 5678'}
              </p>
              <p className="text-white hover:text-[#00F2FF] transition-colors cursor-pointer">
                E: {settings['contact_email'] || 'ops@chantarangsay.org'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-8 border border-white/5 bg-white/[0.01] rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white italic">Platform Online</span>
              </div>
              <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest leading-relaxed">
                Interconnected via Google Stitch<br/>& Distributed Intelligence Protocol
              </p>
          </div>

          <div className="flex flex-col md:items-end gap-6">
            <div className="flex gap-4">
              {['FB', 'YT', 'GH'].map(social => (
                <div key={social} className="w-10 h-10 border border-white/10 flex items-center justify-center text-[10px] font-black hover:border-[#00F2FF] hover:text-[#00F2FF] transition-all cursor-pointer rounded">
                  {social}
                </div>
              ))}
            </div>
            <Link 
              href="/lien-he"
              className="px-6 py-2 bg-white text-[#0A0F14] text-[10px] font-black uppercase tracking-widest rounded hover:bg-[#00F2FF] transition-all"
            >
              Open Communication Port
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

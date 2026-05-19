'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

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
  title = "Dharma Network Nodes"
}) => {
  // Take first 6 for a clean grid
  const displayTalks = dharmaTalks.slice(0, 6);

  return (
    <section id="nodes" className="py-24 bg-[#0A0F14] border-t border-white/5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00F2FF]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4 uppercase">
              {title}
            </h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest border-l-2 border-[#00F2FF] pl-4">
              Real-time synchronization with the stream of Dhamma
            </p>
          </div>
          <Link 
            href="/documents"
            className="text-[10px] font-black tracking-[0.3em] uppercase text-[#00F2FF] hover:bg-[#00F2FF]/10 px-4 py-2 border border-[#00F2FF]/30 rounded transition-all"
          >
            Access Full Library
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTalks.map((talk, idx) => (
            <motion.div
              key={talk.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
            >
              <Link href={`/documents/${talk.slug}`} className="block">
                <div className="relative p-6 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 group-hover:border-[#00F2FF]/50 group-hover:bg-[#00F2FF]/5 shadow-2xl">
                  {/* Digital Decoration */}
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-[#00F2FF] rounded-full animate-pulse shadow-[0_0_10px_#00F2FF]" />
                    <div className="absolute top-4 right-4 w-8 h-[1px] bg-[#00F2FF]/30 -rotate-45 origin-right" />
                  </div>

                  <div className="mb-4">
                    <span className="text-[9px] font-black tracking-widest text-[#00F2FF]/60 uppercase">
                      Node_ID: {talk.id.substring(0, 8)}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1 group-hover:text-[#00F2FF] transition-colors line-clamp-2">
                      {talk.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-8">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-1 h-1 bg-[#00F2FF]/20 rounded-full" />
                      ))}
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-500 group-hover:text-white transition-colors">
                      CONNECTING...
                    </span>
                  </div>

                  {/* Hover Background Hacking Effect */}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00F2FF] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Empty Placeholder / Add Node style */}
          <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl opacity-40">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center mb-4">
              <span className="text-xl">+</span>
            </div>
            <p className="text-[9px] font-bold tracking-widest uppercase text-center">
              Awaiting Next<br/>Transmission
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

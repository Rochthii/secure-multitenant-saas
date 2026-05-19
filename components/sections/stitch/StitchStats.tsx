'use client';

import React from 'react';

interface StitchStatsProps {
  stats?: {
    label: string;
    value: string | number;
    suffix?: string;
  }[];
}

export const StitchStats: React.FC<StitchStatsProps> = ({ stats }) => {
  const defaultStats = [
    { label: "Active Connections", value: "24.8", suffix: "k" },
    { label: "Dharma Nodes Synchronized", value: "1,240", suffix: "" },
    { label: "Global Merit Accumulation", value: "99.9", suffix: "%" },
    { label: "Zen Latency", value: "0", suffix: "ms" },
  ];

  const displayStats = stats || defaultStats;

  return (
    <section className="py-20 bg-[#0A0F14] overflow-hidden border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {displayStats.map((stat, idx) => (
            <div
              key={idx}
              className="group relative"
            >
              <div className="flex flex-col border-l border-white/10 pl-6 group-hover:border-[#00F2FF] transition-colors">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 group-hover:text-[#00F2FF] transition-colors mb-2">
                  {stat.label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter text-white tabular-nums" style={{ fontFamily: 'monospace' }}>
                    {stat.value}
                  </span>
                  {stat.suffix && (
                    <span className="text-xl font-bold text-[#00F2FF]/60 uppercase tracking-tighter">
                      {stat.suffix}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Line Decoration - Static */}
        <div className="mt-20 h-[1px] w-full bg-white/10 relative">
          <div className="absolute top-0 left-1/4 w-12 h-[1px] bg-[#00F2FF]" />
          <div className="absolute top-0 right-1/4 w-12 h-[1px] bg-[#FF007A]/40" />
        </div>
      </div>
    </section>
  );
};

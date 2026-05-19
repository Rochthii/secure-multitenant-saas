'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StitchHeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export const StitchHero: React.FC<StitchHeroProps> = ({
  title = "Digital Zenith",
  subtitle = "The Architecture of Mindfulness",
  description = "Connecting modern technology with ancient wisdom to create a transparent, scalable, and enlightened digital future for all sentinent beings.",
  backgroundImage,
  ctaText = "Explore Network",
  ctaLink = "#"
}) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[#0A0F14] text-white">
      {/* 1. Background */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1E293B 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* 2. Main Content */}
      <div className="container relative z-10 mx-auto px-6 text-center max-w-4xl">
          <span className="inline-block px-4 py-1.5 mb-8 text-[10px] font-black tracking-[0.4em] uppercase border border-white/20 text-white/60 rounded-full">
            SYSTEM STATUS: ENLIGHTENED
          </span>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-none text-white">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href={ctaLink}
              className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-colors"
            >
              {ctaText}
            </a>
            
            <a
              href="#nodes"
              className="px-10 py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-[11px] hover:bg-white/5 transition-colors"
            >
              Source Protocol
            </a>
          </div>
      </div>
    </section>
  );
};

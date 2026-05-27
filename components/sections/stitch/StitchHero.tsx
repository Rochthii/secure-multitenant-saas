'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface StitchHeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export const StitchHero: React.FC<StitchHeroProps> = ({
  title = "Nền Tảng Quản Trị SaaS Đa Khách Hàng (Multi-tenant)",
  description = "Xây dựng hệ thống quản trị trung ương tập trung cho hàng chục chi nhánh và đơn vị thành viên. Tích hợp website động, CMS đa ngôn ngữ, hệ thống kiểm toán tài chính minh bạch và dashboard phân tích thời gian thực.",
  ctaText = "Trải Nghiệm Dashboard",
  ctaLink = "#nodes"
}) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#070A0F] text-white">
      {/* 1. Fine Tech Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.07]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #00F2FF 1px, transparent 1px),
            linear-gradient(to bottom, #00F2FF 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px' 
        }} 
      />
      
      {/* Radial Gradient overlay for soft center focus */}
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#070A0F]/80 to-[#070A0F] z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070A0F]/50 to-[#070A0F] z-0" />

      {/* Decorative Aurora Glows (Dynamic Lighting) */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#00F2FF]/10 to-indigo-600/0 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/5 to-[#00F2FF]/10 rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />

      {/* 2. Main Content */}
      <div className="container relative z-10 mx-auto px-6 text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Tag Pill with Glow */}
          <span className="inline-flex items-center gap-2.5 px-4.5 py-2 mb-8 text-[11px] font-bold tracking-[0.25em] uppercase border border-[#00F2FF]/30 text-[#00F2FF] bg-[#00F2FF]/5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(0,242,255,0.1)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F2FF] animate-pulse" />
            SaaS Enterprise Multi-Tenant Protocol
          </span>

          {/* Title with Gradient Text */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.08] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-[#a3f3ff] max-w-4xl drop-shadow-2xl">
            {title}
          </h1>

          {/* Description with high readability */}
          <p className="text-base md:text-lg text-slate-400 font-normal mb-12 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Modern Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
            <a
              href={ctaLink}
              className="group w-full sm:w-auto px-10 py-4 bg-[#00F2FF] text-black font-extrabold rounded-xl text-xs uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-[0_4px_30px_rgba(0,242,255,0.25)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                {ctaText}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
            
            <a
              href="/admin"
              className="w-full sm:w-auto px-10 py-4 border border-white/10 text-white hover:text-[#00F2FF] font-extrabold rounded-xl text-xs uppercase tracking-widest hover:bg-white/5 hover:border-[#00F2FF]/30 transition-all duration-300 backdrop-blur-sm active:scale-95"
            >
              Kiểm Toán Hệ Thống
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative bottom fade out to next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#070A0F] to-transparent pointer-events-none z-10" />
    </section>
  );
};

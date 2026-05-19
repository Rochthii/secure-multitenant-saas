/**
 * SECTION_REGISTRY — Trung tâm đăng ký Component của Visual Page Builder
 * 
 * TỐI ƯU HIỆU NĂNG (Hybrid Architecture):
 * 1. Modularization: Chia nhỏ registry thành các file chuyên biệt (traditional, modern, artistic, themes).
 *    Giảm gánh nặng parse JS cho Vercel Function khi Cold Start.
 * 2. Hybrid Importing:
 *    - Static Import (Standard/Legacy blocks): Hiệu năng cực cao cho các block nhẹ, cơ bản.
 *    - Dynamic Import (Heavy/Special blocks): Chỉ load mã nguồn khi block được sử dụng trên trang.
 */
import React from 'react';
import { TRADITIONAL_REGISTRY, LEGACY_ALIASES } from './registry/traditional';
import { MODERN_REGISTRY } from './registry/modern';
import { ARTISTIC_REGISTRY } from './registry/artistic';
import { THEME_REGISTRY } from './registry/themes';

// ─── Types ──────────────────────────────────────────────────────────────────
export type SectionDataKey =
    | 'locale'
    | 'tenantId'
    | 'heroSlides'
    | 'dharmaTalks'
    | 'settings'
    | 'introSection'
    | 'abbotSection'
    | 'architectureSection'
    | 'calendarEvents'
    | 'news'
    | 'categories'
    | 'aboutSections'
    | 'upcomingEvents'
    | 'nextMajorFestival';

export type SectionDataMap = {
    locale?: string;
    tenantId?: string;
    heroSlides?: any[];
    dharmaTalks?: any[];
    settings?: any;
    introSection?: any;
    abbotSection?: any;
    architectureSection?: any;
    calendarEvents?: any[];
    news?: any[];
    aboutSections?: any[];
    upcomingEvents?: any[];
    nextMajorFestival?: any;
};

// ─── REGISTRY CONSOLIDATION ──────────────────────────────────────────────────
export const SECTION_REGISTRY: Record<string, {
    name: string;
    description: string;
    category: 'hero' | 'news' | 'dharma' | 'events' | 'about' | 'spiritual' | 'quotes' | 'cta' | 'social' | 'transparency';
    group: 'HERO' | 'INTRO' | 'TRIPLE_GEM' | 'QUOTE_BANNER' | 'NEWS' | 'DHARMA' | 'EVENTS' | 'SOCIAL' | 'LEGACY';
    icon?: string;
    component: React.ComponentType<any>;
    requiredData?: SectionDataKey[];
}> = {
    ...TRADITIONAL_REGISTRY,
    ...MODERN_REGISTRY,
    ...ARTISTIC_REGISTRY,
    ...THEME_REGISTRY,
    ...LEGACY_ALIASES,
};

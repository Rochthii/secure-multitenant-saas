import dynamic from 'next/dynamic';
import React from 'react';

// HELPER: Dynamic Loader
const d = (loader: () => Promise<any>, name?: string) => {
    return dynamic(async () => {
        const mod = await loader();
        return name ? mod[name] : (mod.default || mod);
    }, { ssr: true });
};

export const ARTISTIC_REGISTRY: Record<string, any> = {
    'scripture_scroll': { name: 'Kinh Lá Buông', description: 'Bộ sưu tập di sản Khmer cổ', category: 'about', group: 'INTRO', icon: '📜', component: d(() => import('@/components/sections/about/ScriptureScrollIntro'), 'ScriptureScrollIntro'), requiredData: ['introSection'] },
    'ink_wash_aura': { name: 'Hào Quang Thủy Mặc', description: 'Nghệ thuật loang mực tâm linh', category: 'about', group: 'INTRO', icon: '🎨', component: d(() => import('@/components/sections/about/InkWashAuraIntro'), 'InkWashAuraIntro'), requiredData: ['introSection'] },
    'zen_breathing': { name: 'Vòng Thở Thiền Định', description: 'Anapanasati Banner động', category: 'spiritual', group: 'TRIPLE_GEM', icon: '🌬', component: d(() => import('@/components/sections/zen/ZenBreathingBanner'), 'ZenBreathingBanner') },
    
    // STITCH — Enterprise Corporate Blocks
    'stitch-hero': { name: 'Hero Kỹ Thuật Số', description: 'Màn hình chào doanh nghiệp phong cách Digital — nền tối, hiệu ứng ánh sáng neon', category: 'hero', group: 'HERO', icon: '🎬', component: d(() => import('@/components/sections/stitch/StitchHero'), 'StitchHero'), requiredData: ['settings'] },
    'stitch-nodes': { name: 'Mạng Lưới Nội Dung', description: 'Hiển thị E-Learning / Đào tạo dạng node kết nối kỹ thuật số', category: 'dharma', group: 'DHARMA', icon: '🔗', component: d(() => import('@/components/sections/stitch/StitchNodes'), 'StitchNodes'), requiredData: ['dharmaTalks'] },
    'stitch-stats': { name: 'Thống Kê Hệ Thống', description: 'Dashboard chỉ số hoạt động — nhân sự, tài liệu, băng thông, tuân thủ', category: 'about', group: 'INTRO', icon: '📊', component: d(() => import('@/components/sections/stitch/StitchStats'), 'StitchStats') },
    'stitch-events': { name: 'Lịch Sự Kiện Nội Bộ', description: 'Sự kiện và lịch họp theo phong cách lưới kỹ thuật số compact', category: 'events', group: 'EVENTS', icon: '📅', component: d(() => import('@/components/sections/stitch/StitchEvents'), 'StitchEvents'), requiredData: ['upcomingEvents'] },
    'stitch-intro': { name: 'Giới Thiệu Doanh Nghiệp', description: 'Khối giới thiệu tổ chức phong cách Digital Legacy — nền tối hiện đại', category: 'about', group: 'INTRO', icon: '🏢', component: d(() => import('@/components/sections/stitch/StitchIntro'), 'StitchIntro'), requiredData: ['introSection'] },
    'stitch-footer-strip': { name: 'Thông Tin Liên Hệ (Footer)', description: 'Dải thông tin liên lạc 3 cột phong cách Terminal — địa chỉ, giờ làm việc, CTA', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: d(() => import('@/components/sections/stitch/StitchFooterStrip'), 'StitchFooterStrip'), requiredData: ['settings'] },
};


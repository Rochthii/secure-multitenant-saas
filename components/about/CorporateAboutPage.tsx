'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
    History,
    Network,
    Landmark,
    ClipboardList,
    Users,
    Zap,
    Gem,
    Sprout,
    Trophy,
    User,
    Pin,
    Calendar,
    Lock,
    BarChart3,
    Globe,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AboutSection {
    id: string;
    key: string;
    title_vi: string;
    content_vi: string | null;
    summary_vi: string | null;
    image_url: string | null;
    display_order: number | null;
    hasChildren?: boolean;
}

interface CorporateAboutPageProps {
    sections: AboutSection[];
    siteName: string;
    siteDescription?: string;
    heroImage?: string;
    logoUrl?: string | null;
    address?: string;
    phone?: string;
    email?: string;
    foundedYear?: string;
}

// ─── Section Icon & Label Map ────────────────────────────────────────────────

const SECTION_META: Record<string, { icon: React.ComponentType<any>; label: string; gradient: string }> = {
    'dong-chay-lich-su':       { icon: History, label: 'Lịch Sử',          gradient: 'from-indigo-500/20 to-violet-500/10' },
    'truyen-thua-tiep-noi':    { icon: Network, label: 'Ban Điều Hành',     gradient: 'from-cyan-500/20 to-emerald-500/10' },
    'di-san-nghe-thuat':       { icon: Landmark, label: 'Di Sản & Giá Trị', gradient: 'from-amber-500/20 to-orange-500/10' },
    'noi-quy-tu-vien':         { icon: ClipboardList, label: 'Quy Trình SOP',     gradient: 'from-emerald-500/20 to-cyan-500/10' },
    'doi-ngu':                 { icon: Users, label: 'Đội Ngũ',            gradient: 'from-violet-500/20 to-indigo-500/10' },
    'su-menh':                 { icon: Zap, label: 'Sứ Mệnh',           gradient: 'from-rose-500/20 to-pink-500/10' },
    'gia-tri-cot-loi':         { icon: Gem, label: 'Giá Trị Cốt Lõi',  gradient: 'from-sky-500/20 to-blue-500/10' },
    'doanh-nghiep-xa-hoi':     { icon: Sprout, label: 'Trách Nhiệm XH',   gradient: 'from-green-500/20 to-teal-500/10' },
    'history':                 { icon: History, label: 'Lịch Sử',          gradient: 'from-indigo-500/20 to-violet-500/10' },
    'founder':                 { icon: Trophy, label: 'Sáng Lập Viên',    gradient: 'from-amber-500/20 to-yellow-500/10' },
    'abbot':                   { icon: User, label: 'Ban Lãnh Đạo',     gradient: 'from-cyan-500/20 to-blue-500/10' },
};

function getSectionMeta(key: string) {
    const exact = SECTION_META[key];
    if (exact) return exact;
    const k = key.toLowerCase();
    if (k.includes('lich-su') || k.includes('history')) return SECTION_META['dong-chay-lich-su'];
    if (k.includes('truyen-thua') || k.includes('lanh-dao') || k.includes('abbot')) return SECTION_META['truyen-thua-tiep-noi'];
    if (k.includes('di-san') || k.includes('nghe-thuat')) return SECTION_META['di-san-nghe-thuat'];
    if (k.includes('doi-ngu') || k.includes('team')) return SECTION_META['doi-ngu'];
    if (k.includes('su-menh') || k.includes('mission')) return SECTION_META['su-menh'];
    if (k.includes('gia-tri') || k.includes('value')) return SECTION_META['gia-tri-cot-loi'];
    return { icon: Pin, label: 'Giới Thiệu', gradient: 'from-slate-500/20 to-slate-400/10' };
}

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────

function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, visible };
}

// ─── Reveal Wrapper ───────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    const { ref, visible } = useReveal();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const { ref, visible } = useReveal();
    useEffect(() => {
        if (!visible) return;
        let start = 0;
        const duration = 1800;
        const startTime = performance.now();
        const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [visible, target]);
    return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CorporateAboutPage({
    sections,
    siteName,
    siteDescription,
    heroImage,
    logoUrl,
    address,
    phone,
    email,
    foundedYear,
}: CorporateAboutPageProps) {

    // Phân tách sections: history (dòng thời gian), còn lại hiển thị grid
    const historySection = sections.find(s =>
        s.key.includes('lich-su') || s.key.includes('history') || s.key.includes('dong-chay')
    );
    const gridSections = sections.filter(s => s.id !== historySection?.id);

    // Timeline items từ nội dung lịch sử (parse heading h2/h3 ra timeline events)
    const timelineItems = React.useMemo(() => {
        if (!historySection?.content_vi) return [];
        const matches = [...historySection.content_vi.matchAll(/<h[23][^>]*>([^<]+)<\/h[23]>/gi)];
        return matches.slice(0, 5).map((m, i) => ({
            id: i,
            title: m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        }));
    }, [historySection]);

    return (
        <div
            style={{
                background: '#060608',
                color: '#f1f1f5',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                minHeight: '100vh',
                overflowX: 'hidden',
            }}
        >
            {/* ── Google Fonts injection ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
                .corp-font-display { font-family: 'Syne', sans-serif !important; }
                .corp-font-mono { font-family: 'DM Mono', monospace !important; }
                .corp-gradient-text {
                    background: linear-gradient(120deg, rgb(var(--theme-primary)), rgb(var(--theme-accent)));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .corp-mesh {
                    background:
                        radial-gradient(ellipse 60% 50% at 20% 20%, rgba(var(--theme-primary),0.1) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 40% at 80% 10%, rgba(var(--theme-accent),0.07) 0%, transparent 55%),
                        radial-gradient(ellipse 40% 60% at 50% 80%, rgba(var(--theme-primary),0.06) 0%, transparent 60%);
                }
                .corp-grid-pattern {
                    background-image:
                        linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
                .corp-card {
                    background: #0e0e14;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 20px;
                    transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
                }
                .corp-card:hover {
                    border-color: rgba(var(--theme-primary), 0.4);
                    transform: translateY(-6px);
                    box-shadow: 0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(var(--theme-primary),0.1);
                }
                .corp-btn-primary {
                    display: inline-flex; align-items: center; gap: 10px;
                    background: linear-gradient(135deg, rgb(var(--theme-primary)), rgb(var(--theme-accent)));
                    color: #fff; border: none;
                    padding: 14px 28px; border-radius: 12px;
                    font-size: 0.9rem; font-weight: 600;
                    text-decoration: none; cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 0 30px rgba(var(--theme-primary),0.3);
                }
                .corp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(var(--theme-primary),0.45); }
                .corp-btn-ghost {
                    display: inline-flex; align-items: center; gap: 10px;
                    color: rgba(255,255,255,0.5);
                    border: 1px solid rgba(255,255,255,0.12);
                    padding: 14px 28px; border-radius: 12px;
                    font-size: 0.9rem; font-weight: 500;
                    text-decoration: none; cursor: pointer;
                    transition: all 0.3s;
                    background: transparent;
                }
                .corp-btn-ghost:hover { color: #fff; border-color: rgba(var(--theme-primary),0.5); }
                .corp-scrollbar::-webkit-scrollbar { width: 4px; }
                .corp-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .corp-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--theme-primary),0.4); border-radius: 10px; }
            `}</style>

            {/* ════════════════════════════════════
                BACKGROUND LAYERS
            ════════════════════════════════════ */}
            <div className="corp-mesh" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
            <div className="corp-grid-pattern" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

            {/* ════════════════════════════════════
                HERO
            ════════════════════════════════════ */}
            <section style={{ position: 'relative', zIndex: 10, minHeight: '85vh', display: 'flex', alignItems: 'center', padding: '120px 48px 80px', maxWidth: 1280, margin: '0 auto' }}>
                {heroImage && (
                    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 28, zIndex: -1 }}>
                        <Image src={heroImage} alt={siteName} fill className="object-cover" style={{ opacity: 0.07, filter: 'saturate(0.5)' }} sizes="100vw" />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,6,8,0) 0%, rgba(6,6,8,0.8) 60%, rgba(6,6,8,1) 100%)' }} />
                    </div>
                )}

                <div style={{ maxWidth: 680 }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        padding: '8px 18px',
                        background: 'rgba(var(--theme-primary),0.1)',
                        border: '1px solid rgba(var(--theme-primary),0.3)',
                        borderRadius: 100,
                        marginBottom: 32,
                        animation: 'fadeUp 0.8s ease both',
                    }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'rgb(var(--theme-accent))',
                            animation: 'pulse 2s ease infinite',
                        }} />
                        <span className="corp-font-mono" style={{ fontSize: '0.7rem', color: 'rgb(var(--theme-primary-light))', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600 }}>
                            Hồ Sơ Năng Lực Doanh Nghiệp
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="corp-font-display" style={{
                        fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
                        fontWeight: 800,
                        lineHeight: 1.05,
                        letterSpacing: '-0.04em',
                        marginBottom: 24,
                        animation: 'fadeUp 0.8s 0.1s ease both',
                    }}>
                        <span style={{ color: '#f1f1f5' }}>Giới Thiệu</span><br />
                        <span className="corp-gradient-text">{siteName}</span>
                    </h1>

                    {/* Divider */}
                    <div style={{
                        width: 48, height: 2,
                        background: 'linear-gradient(90deg, rgb(var(--theme-primary)), rgb(var(--theme-accent)))',
                        marginBottom: 28,
                        animation: 'fadeUp 0.8s 0.15s ease both',
                    }} />

                    {/* Description */}
                    <p style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '1.1rem',
                        fontWeight: 300,
                        lineHeight: 1.8,
                        maxWidth: 520,
                        marginBottom: 40,
                        animation: 'fadeUp 0.8s 0.2s ease both',
                    }}>
                        {siteDescription || `Tầm nhìn chiến lược, đội ngũ tài năng và hành trình kiến tạo giá trị bền vững của ${siteName}.`}
                    </p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', animation: 'fadeUp 0.8s 0.3s ease both' }}>
                        <Link href="#sections" className="corp-btn-primary">
                            Xem Hồ Sơ Chi Tiết
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                        <Link href="/lien-he" className="corp-btn-ghost">Liên Hệ Ngay →</Link>
                    </div>
                </div>

                {/* Hero floating stat cards */}
                <div style={{
                    position: 'absolute', right: 48, top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', flexDirection: 'column', gap: 16,
                    width: 280,
                }}>
                    {[
                        { label: 'Năm Thành Lập', value: foundedYear || '2020', icon: Calendar, color: 'var(--theme-primary)' },
                        { label: 'Hoạt Động Liên Tục', value: '99.9%', icon: Zap, color: 'var(--theme-accent)' },
                        { label: 'Dữ Liệu Minh Bạch', value: '100%', icon: Lock, color: 'var(--theme-primary)' },
                    ].map((stat, i) => (
                        <Reveal key={stat.label} delay={i * 100}>
                            <div style={{
                                background: '#0e0e14',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 16,
                                padding: '18px 22px',
                                backdropFilter: 'blur(12px)',
                                display: 'flex', alignItems: 'center', gap: 16,
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                    background: `rgba(var(--theme-primary),0.12)`,
                                    border: `1px solid rgba(var(--theme-primary),0.2)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <stat.icon style={{ width: 20, height: 20, color: 'rgb(var(--theme-primary-light))' }} />
                                </div>
                                <div>
                                    <div className="corp-font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f1f5' }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <style>{`
                    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }
                    @media (max-width: 1100px) {
                        .corp-hero-cards { display: none !important; }
                    }
                `}</style>
            </section>

            {/* ════════════════════════════════════
                STATS BAND
            ════════════════════════════════════ */}
            <div style={{
                position: 'relative', zIndex: 10,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {[
                        { num: sections.length, suffix: '+', label: 'Mục Giới Thiệu', sub: 'Hồ sơ chi tiết' },
                        { num: 100, suffix: '%', label: 'Minh Bạch', sub: 'Mọi hoạt động' },
                        { num: 99, suffix: '.9%', label: 'Uptime SLA', sub: 'Hệ thống trực tuyến' },
                        { num: 24, suffix: '/7', label: 'Hỗ Trợ', sub: 'Tiếng Việt' },
                    ].map((s, i) => (
                        <div key={s.label} style={{
                            padding: '48px 40px',
                            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        }}>
                            <Reveal>
                                <div className="corp-font-display" style={{
                                    fontSize: '3rem', fontWeight: 800, lineHeight: 1,
                                    color: 'rgb(var(--theme-primary))',
                                    marginBottom: 8,
                                }}>
                                    <AnimatedNumber target={s.num} suffix={s.suffix} />
                                </div>
                                <div style={{ color: '#f1f1f5', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>{s.sub}</div>
                            </Reveal>
                        </div>
                    ))}
                </div>
            </div>

            {/* ════════════════════════════════════
                ABOUT / OVERVIEW (section đầu tiên)
            ════════════════════════════════════ */}
            {sections[0] && (
                <section style={{ position: 'relative', zIndex: 10, padding: '120px 48px', maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                        {/* Left: Image */}
                        <Reveal>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: '100%', aspectRatio: '4/5',
                                    background: '#0e0e14',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 24,
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}>
                                    {sections[0].image_url ? (
                                        <Image src={sections[0].image_url} alt={sections[0].title_vi} fill className="object-cover" style={{ opacity: 0.85 }} sizes="50vw" />
                                    ) : (
                                        <div style={{
                                            width: '100%', height: '100%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexDirection: 'column', gap: 16,
                                            background: 'linear-gradient(135deg, rgba(var(--theme-primary),0.08) 0%, rgba(var(--theme-accent),0.04) 100%)',
                                        }}>
                                            {/* Tech grid decoration */}
                                            <svg viewBox="0 0 200 200" width="140" height="140" fill="none" stroke="rgba(var(--theme-primary),0.3)" strokeWidth="0.8"
                                                style={{ animation: 'spin 40s linear infinite' }}>
                                                <circle cx="100" cy="100" r="92" strokeDasharray="4,6" />
                                                <circle cx="100" cy="100" r="72" />
                                                <circle cx="100" cy="100" r="52" strokeDasharray="8,4" />
                                                <path d="M100,28 L115,40 L111,45 L100,36 L89,45 L85,40 Z" fill="rgba(var(--theme-primary),0.4)" stroke="none" />
                                                <path d="M100,53 L115,65 L111,70 L100,61 L89,70 L85,65 Z" fill="rgba(var(--theme-primary),0.3)" stroke="none" />
                                                <path d="M100,78 L115,90 L111,95 L100,86 L89,95 L85,90 Z" fill="rgba(var(--theme-primary),0.2)" stroke="none" />
                                                <line x1="100" y1="18" x2="100" y2="182" strokeDasharray="3,4" />
                                                <line x1="18" y1="100" x2="182" y2="100" strokeDasharray="3,4" />
                                                <circle cx="100" cy="100" r="4" fill="rgb(var(--theme-primary))" stroke="none" />
                                            </svg>
                                            <div className="corp-font-display" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(var(--theme-primary),0.6)' }}>
                                                {siteName}
                                            </div>
                                        </div>
                                    )}
                                    {/* Corner accent */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                                        background: 'linear-gradient(90deg, transparent, rgb(var(--theme-primary)), rgb(var(--theme-accent)), transparent)',
                                    }} />
                                </div>
                                {/* Offset frame */}
                                <div style={{
                                    position: 'absolute', inset: -12,
                                    border: '1px solid rgba(var(--theme-primary),0.15)',
                                    borderRadius: 28,
                                    zIndex: -1,
                                }} />
                                {/* Info badge */}
                                <div style={{
                                    position: 'absolute', bottom: -20, right: -20,
                                    background: '#15151e',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 16, padding: '18px 22px',
                                    backdropFilter: 'blur(20px)',
                                }}>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hồ Sơ</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sections[0].title_vi}</div>
                                    {sections[0].hasChildren && (
                                        <div style={{ fontSize: '0.7rem', color: 'rgb(var(--theme-primary))', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span>Xem chi tiết</span>
                                            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Reveal>

                        {/* Right: Content */}
                        <Reveal delay={120}>
                            <div className="corp-font-mono" style={{ fontSize: '0.68rem', color: 'rgb(var(--theme-accent))', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ width: 20, height: 1, background: 'rgb(var(--theme-accent))', display: 'block' }} />
                                {getSectionMeta(sections[0].key).label}
                            </div>
                            <h2 className="corp-font-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>
                                {sections[0].title_vi}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.85, marginBottom: 32, fontWeight: 300 }}>
                                {sections[0].summary_vi || (sections[0].content_vi || '').replace(/<[^>]+>/g, '').substring(0, 320) + '…'}
                            </p>
                            {/* Feature bullets */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
                                {[
                                    { icon: Lock, text: 'Bảo mật đa lớp, phân quyền chính xác theo vai trò', keyStr: 'security' },
                                    { icon: BarChart3, text: 'Minh bạch tài chính toàn diện với audit log bất biến', keyStr: 'transparency' },
                                    { icon: Globe, text: 'Multi-tenant cô lập hoàn toàn, domain riêng từng đơn vị', keyStr: 'multitenant' },
                                ].map(f => (
                                    <div key={f.keyStr} style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '14px 18px',
                                        background: '#0e0e14',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: 12,
                                        transition: 'border-color 0.3s',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(var(--theme-primary),0.3)')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <f.icon style={{ width: 18, height: 18, color: 'rgb(var(--theme-accent))' }} />
                                        </span>
                                        <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>{f.text}</span>
                                    </div>
                                ))}
                            </div>
                            <Link href={`/gioi-thieu/${sections[0].key}`} className="corp-btn-primary">
                                Đọc Đầy Đủ
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </Link>
                        </Reveal>
                    </div>
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </section>
            )}

            {/* ════════════════════════════════════
                SECTIONS GRID
            ════════════════════════════════════ */}
            <section id="sections" style={{ position: 'relative', zIndex: 10, padding: '120px 48px', maxWidth: 1280, margin: '0 auto' }}>
                <Reveal>
                    <div style={{ textAlign: 'center', marginBottom: 72 }}>
                        <div className="corp-font-mono" style={{ fontSize: '0.68rem', color: 'rgb(var(--theme-accent))', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <span style={{ width: 20, height: 1, background: 'rgb(var(--theme-accent))', display: 'block' }} />
                            Hồ Sơ Năng Lực
                            <span style={{ width: 20, height: 1, background: 'rgb(var(--theme-accent))', display: 'block' }} />
                        </div>
                        <h2 className="corp-font-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
                            Tìm Hiểu <span className="corp-gradient-text">Chúng Tôi</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto', lineHeight: 1.8, fontWeight: 300 }}>
                            Mỗi khía cạnh được xây dựng với sự tận tâm và cam kết minh bạch tuyệt đối.
                        </p>
                    </div>
                </Reveal>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {gridSections.map((sec, i) => {
                        const meta = getSectionMeta(sec.key);
                        const excerpt = (sec.summary_vi || (sec.content_vi || '').replace(/<[^>]+>/g, '')).substring(0, 180);
                        return (
                            <Reveal key={sec.id} delay={i * 60}>
                                <Link
                                    href={`/gioi-thieu/${sec.key}`}
                                    className="corp-card"
                                    style={{ display: 'block', padding: 32, textDecoration: 'none', color: 'inherit', position: 'relative', overflow: 'hidden' }}
                                >
                                    {/* Top accent line on hover (CSS transition only) */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                                        background: 'linear-gradient(90deg, transparent, rgb(var(--theme-primary)), transparent)',
                                        opacity: 0,
                                        transition: 'opacity 0.4s',
                                    }} className="card-top-line" />

                                    <div style={{
                                        width: 52, height: 52, borderRadius: 14,
                                        background: `linear-gradient(135deg, rgba(var(--theme-primary),0.2), rgba(var(--theme-accent),0.1))`,
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: 20,
                                    }}>
                                        <meta.icon style={{ width: 22, height: 22, color: 'rgb(var(--theme-primary-light))' }} />
                                    </div>

                                    <div className="corp-font-mono" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 8 }}>
                                        {String(i + 1).padStart(2, '0')} / {meta.label}
                                    </div>
                                    <div className="corp-font-display" style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12, color: '#f1f1f5' }}>
                                        {sec.title_vi}
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.75, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 20 }}>
                                        {excerpt || 'Khám phá nội dung chi tiết về chủ đề này.'}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'rgb(var(--theme-primary))' }}>
                                        Khám Phá
                                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </div>
                                </Link>
                            </Reveal>
                        );
                    })}
                </div>
            </section>

            {/* ════════════════════════════════════
                TIMELINE (từ section lịch sử)
            ════════════════════════════════════ */}
            {historySection && timelineItems.length > 0 && (
                <section style={{ position: 'relative', zIndex: 10, padding: '120px 48px', maxWidth: 1280, margin: '0 auto' }}>
                    <Reveal>
                        <div className="corp-font-mono" style={{ fontSize: '0.68rem', color: 'rgb(var(--theme-accent))', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 20, height: 1, background: 'rgb(var(--theme-accent))', display: 'block' }} />
                            Hành Trình
                        </div>
                        <h2 className="corp-font-display" style={{ fontSize: 'clamp(2rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 64 }}>
                            {historySection.title_vi}
                        </h2>
                    </Reveal>

                    <div style={{ position: 'relative' }}>
                        {/* Spine line */}
                        <div style={{
                            position: 'absolute', left: 120, top: 0, bottom: 0, width: 1,
                            background: 'linear-gradient(180deg, transparent, rgb(var(--theme-primary)), rgb(var(--theme-accent)), transparent)',
                        }} />

                        {timelineItems.map((item, i) => (
                            <Reveal key={item.id} delay={i * 80}>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 40, marginBottom: 36, alignItems: 'start' }}>
                                    <div className="corp-font-mono" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textAlign: 'right', paddingTop: 20, fontWeight: 500 }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div style={{
                                        background: '#0e0e14',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: 16, padding: '22px 28px',
                                        position: 'relative',
                                        transition: 'border-color 0.3s',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(var(--theme-primary),0.35)')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
                                    >
                                        {/* Dot */}
                                        <div style={{
                                            position: 'absolute', left: -20, top: 22,
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: 'rgb(var(--theme-primary))',
                                            boxShadow: '0 0 12px rgb(var(--theme-primary))',
                                        }} />
                                        <div style={{ fontWeight: 600, color: '#f1f1f5', lineHeight: 1.5 }}>{item.title}</div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}

                        {/* Read more */}
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 40 }}>
                            <div />
                            <Reveal>
                                <Link href={`/gioi-thieu/${historySection.key}`} className="corp-btn-ghost" style={{ display: 'inline-flex' }}>
                                    Đọc Toàn Bộ Lịch Sử
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </Link>
                            </Reveal>
                        </div>
                    </div>
                </section>
            )}

            {/* ════════════════════════════════════
                CONTACT / CTA
            ════════════════════════════════════ */}
            <section style={{ position: 'relative', zIndex: 10, padding: '80px 48px 120px', maxWidth: 1280, margin: '0 auto' }}>
                <Reveal>
                    <div style={{
                        background: '#0e0e14',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 28,
                        padding: '72px 60px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Top line */}
                        <div style={{
                            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                            width: 280, height: 1,
                            background: 'linear-gradient(90deg, transparent, rgb(var(--theme-primary)), rgb(var(--theme-accent)), transparent)',
                        }} />
                        {/* Glow */}
                        <div style={{
                            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                            background: 'radial-gradient(ellipse, rgba(var(--theme-primary),0.1) 0%, transparent 70%)',
                            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                            pointerEvents: 'none',
                        }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div className="corp-font-mono" style={{ fontSize: '0.68rem', color: 'rgb(var(--theme-accent))', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <span style={{ width: 20, height: 1, background: 'rgb(var(--theme-accent))', display: 'block' }} />
                                Liên Hệ
                                <span style={{ width: 20, height: 1, background: 'rgb(var(--theme-accent))', display: 'block' }} />
                            </div>
                            <h2 className="corp-font-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16 }}>
                                Sẵn Sàng Hợp Tác?
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 40, maxWidth: 440, margin: '0 auto 40px', lineHeight: 1.8, fontWeight: 300 }}>
                                Liên hệ đội ngũ để nhận tư vấn và bản demo miễn phí phù hợp với nhu cầu của tổ chức.
                            </p>

                            {/* Contact details from settings */}
                            {(address || phone || email) && (
                                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
                                    {address && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 18px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: 10, fontSize: '0.85rem',
                                        }}>
                                            <MapPin style={{ width: 16, height: 16, color: 'rgb(var(--theme-accent))' }} />
                                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{address}</span>
                                        </div>
                                    )}
                                    {phone && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 18px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: 10, fontSize: '0.85rem',
                                        }}>
                                            <Phone style={{ width: 16, height: 16, color: 'rgb(var(--theme-accent))' }} />
                                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{phone}</span>
                                        </div>
                                    )}
                                    {email && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 18px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: 10, fontSize: '0.85rem',
                                        }}>
                                            <Mail style={{ width: 16, height: 16, color: 'rgb(var(--theme-accent))' }} />
                                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{email}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                                <Link href="/lien-he" className="corp-btn-primary">
                                    Gửi Yêu Cầu Ngay
                                </Link>
                                <Link href="/giai-phap" className="corp-btn-ghost">
                                    Xem Giải Pháp →
                                </Link>
                            </div>

                            {/* Trust signals */}
                            <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
                                {['Không cần thẻ tín dụng', 'Triển khai trong 24 giờ', 'Hỗ trợ 24/7 tiếng Việt'].map(t => (
                                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
                                        <svg width="14" height="14" fill="none" stroke="rgba(var(--theme-accent),1)" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>
        </div>
    );
}

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowRight, BookOpen, Heart, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const CULTURE_PAGES = [
    {
        title: "Bản Sắc Văn Hóa Khmer",
        description: "Tìm hiểu ngôn ngữ, phong tục tập quán và trang phục truyền thống của người Khmer Nam Bộ được gìn giữ qua nhiều thế hệ tại Chi nhánh Chantarangsay.",
        link: "/van-hoa/ban-sac-khmer",
        image: "/images/hero-ceremony.jpg",
        icon: Sparkles,
        color: "text-amber-500",
        bgHover: "hover:bg-amber-50"
    },
    {
        title: "Nghi Lễ Cơ Bản",
        description: "Hướng dẫn thực hành nghi thức dâng hương, đảnh lễ chư Tăng, thọ giới và các bài kinh tụng niệm phổ biến dành cho Nhân sự.",
        link: "/van-hoa/nghi-le-co-ban",
        image: "/images/hero-monks-prayer.jpg",
        icon: BookOpen,
        color: "text-blue-500",
        bgHover: "hover:bg-blue-50"
    },
    {
        title: "Nội Quy Tự Viện",
        description: "Những quy định, nguyên tắc và chuẩn mực chung dành cho chư Tăng, Nhân sự và du khách khi đến viếng chi nhánh.",
        link: "/gioi-thieu/noi-quy-tu-vien",
        image: "/images/hero-tenant-main.jpg",
        icon: Heart,
        color: "text-rose-500",
        bgHover: "hover:bg-rose-50"
    },
    {
        title: "Nên Và Không Nên",
        description: "Những lưu ý quan trọng về trang phục, lời ăn tiếng nói và hành động để tránh phạm lỗi, giữ gìn sự trang nghiêm của chi nhánh.",
        link: "/van-hoa/nen-va-khong-nen",
        image: "/images/hero-garden.jpg",
        icon: Shield,
        color: "text-emerald-500",
        bgHover: "hover:bg-emerald-50"
    }
];

export default function CultureHubContent() {
    return (
        <div className="mt-16 border-t border-gold-primary/20 pt-12">
            <div className="text-center mb-10">
                <span className="text-gold-primary uppercase tracking-widest text-sm font-bold block mb-2">
                    Khám Phá
                </span>
                <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-coffee-dark mb-4">
                    Góc Đời Sống Văn Hóa
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Kính mời quý Nhân sự và du khách tìm hiểu sâu hơn về nét đẹp văn hóa, phong tục tập quán, cũng như các nghi thức thiêng liêng tại tự viện.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {CULTURE_PAGES.map((page, idx) => {
                    const Icon = page.icon;
                    return (
                        <Link
                            key={idx}
                            href={page.link}
                            className={cn(
                                "group bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex flex-col items-center text-center transition-all duration-300",
                                "hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden",
                                page.bgHover
                            )}
                        >
                            {/* Decorative background circle */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>

                            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6 border-4 border-white shadow-md">
                                <Image
                                    src={page.image}
                                    alt={page.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md mb-4 -mt-12 z-10", page.color)}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <h3 className="text-2xl font-playfair font-bold text-coffee-dark mb-3">
                                {page.title}
                            </h3>
                            <p className="text-gray-600 mb-6 flex-1 text-sm leading-relaxed">
                                {page.description}
                            </p>

                            <div className="mt-auto inline-flex items-center gap-2 text-gold-primary font-bold uppercase tracking-wide text-sm group-hover:gap-4 transition-all">
                                Xem chi tiết <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

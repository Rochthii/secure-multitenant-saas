'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Construction, ShieldCheck } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

function cn(...classes: (string | undefined | boolean)[]) {
    return classes.filter(Boolean).join(' ');
}

interface ClientProps {
    isCompany: boolean;
    locale: string;
}

export default function HangMucDuAnClientContent({ isCompany, locale }: ClientProps) {
    const categories = [
        {
            id: 'dang-trien-khai',
            title: isCompany ? 'Dự Án Đang Thực Hiện' : 'Dự Án Đang Triển Khai',
            description: isCompany 
                ? 'Các hạng mục đang trong quá trình thực hiện và kêu gọi sự đồng hành từ cộng đồng.'
                : 'Các công trình đang trong quá trình kiến thiết và kêu gọi thanh toán phát tâm từ cộng đồng.',
            icon: Construction,
            href: `/${isCompany ? 'du-an' : 'transactions'}/hang-muc-du-an/dang-trien-khai`,
            color: isCompany ? 'bg-[#FFD700]/10' : 'bg-amber-50',
            iconColor: isCompany ? 'text-[#FFD700]' : 'text-amber-600',
            borderColor: isCompany ? 'group-hover:border-[#FFD700]/50' : 'group-hover:border-amber-500/50'
        },
        {
            id: 'da-hoan-thanh',
            title: isCompany ? 'Dự Án Đã Hoàn Thành' : 'Dự Án Đã Hoàn Thành',
            description: isCompany
                ? 'Những dự án đã hoàn tất nhờ sự chung tay đóng góp và đồng hành của các đối tác, khách hàng.'
                : 'Những công trình đã hoàn tất viên mãn nhờ sự chung tay đóng góp quý báu của quý Nhân sự.',
            icon: CheckCircle2,
            href: `/${isCompany ? 'du-an' : 'transactions'}/hang-muc-du-an/da-hoan-thanh`,
            color: isCompany ? 'bg-[#00D2FF]/10' : 'bg-green-50',
            iconColor: isCompany ? 'text-[#00D2FF]' : 'text-green-600',
            borderColor: isCompany ? 'group-hover:border-[#00D2FF]/50' : 'group-hover:border-green-500/50'
        }
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 20
            } as any
        }
    };

    return (
        <div className={cn("min-h-screen pb-24", isCompany ? "bg-[#FAF8F5]" : "bg-[#FAF6F0]")}>
            {/* Hero Section */}
            <section className={cn(
                "relative min-h-[45vh] flex items-center justify-center overflow-hidden pt-20",
                isCompany ? "bg-[#0A0F1A]" : "bg-[#36271c]"
            )}>
                {/* Background Effects */}
                <div className="absolute inset-0 z-0">
                    {isCompany ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-[#001530] via-[#0A0F1A] to-[#050B14]" />
                            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#00D2FF]/10 blur-[120px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#002B5B]/30 blur-[150px]" />
                        </>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-[#36271c]" />
                            <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                        </>
                    )}
                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
                    >
                        <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/90">
                            {isCompany ? 'Hạng Mục Dự Án' : 'Hạng Mục Thanh toán'}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.8 }}
                        className={cn(
                            "text-4xl md:text-6xl font-black mb-8 tracking-tighter",
                            isCompany ? "text-white" : "text-[#f8d29d] font-playfair"
                        )}
                    >
                        {isCompany ? 'Hạng Mục Dự Án' : 'Hạng Mục Thanh toán'}
                    </motion.h1>

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={cn(
                            "w-24 h-1 mx-auto mb-8",
                            isCompany ? "bg-gradient-to-r from-transparent via-[#FFD700] to-transparent" : "bg-[#f8d29d]"
                        )}
                    />

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className={cn(
                            "text-lg md:text-xl max-w-2xl mx-auto italic font-medium leading-relaxed",
                            isCompany ? "text-gray-400" : "text-stone-300"
                        )}
                    >
                        {isCompany 
                            ? '"Đồng hành cùng cộng đồng, kiến tạo tương lai bền vững."'
                            : '"Xây chi nhánh tô tượng đúc chuông / Ba giao dịch ấy thập phương nên làm."'
                        }
                    </motion.p>
                </div>

                {/* Bottom Curve Decor */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FAF8F5] to-transparent z-10" />
            </section>

            {/* Selection Grid */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16 relative z-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <motion.div key={cat.id} variants={itemVariants}>
                                <Link href={cat.href} className="group block h-full">
                                    <Card className={cn(
                                        "h-full border-white/80 bg-white/70 backdrop-blur-xl overflow-hidden transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_50px_rgba(0,43,91,0.1)] group-hover:-translate-y-2 rounded-[2rem] border",
                                        cat.borderColor
                                    )}>
                                        <CardContent className="p-10 flex flex-col items-center text-center h-full">
                                            <div className={cn(
                                                "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm",
                                                cat.color
                                            )}>
                                                <Icon className={cn("w-10 h-10", cat.iconColor)} />
                                            </div>
                                            <h3 className={cn(
                                                "text-2xl md:text-3xl font-extrabold mb-4 transition-colors leading-tight",
                                                isCompany ? "text-[#002B5B] group-hover:text-[#0088AA]" : "text-[#36271c] group-hover:text-amber-800 font-playfair"
                                            )}>
                                                {cat.title}
                                            </h3>
                                            <p className="text-gray-600 font-medium mb-10 flex-1 leading-relaxed text-lg">
                                                {cat.description}
                                            </p>
                                            <div className={cn(
                                                "inline-flex items-center gap-3 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300",
                                                isCompany
                                                    ? "bg-[#002B5B]/5 text-[#002B5B] group-hover:bg-[#002B5B] group-hover:text-white"
                                                    : "bg-[#36271c]/5 text-[#36271c] group-hover:bg-[#36271c] group-hover:text-white"
                                            )}>
                                                Khám phá danh sách
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Footer Message Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className={cn(
                        "mt-20 relative overflow-hidden p-12 rounded-[3rem] text-center max-w-4xl mx-auto shadow-2xl",
                        isCompany ? "bg-gradient-to-br from-[#002B5B] to-[#001936]" : "bg-gradient-to-br from-[#36271c] to-[#251a12]"
                    )}
                >
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                    <div className="relative z-10">
                        <p className="text-white/90 font-medium italic text-xl mb-10 leading-relaxed">
                            {isCompany
                                ? '"Mọi sự đồng hành và đóng góp của quý vị đều được ghi nhận minh bạch và góp phần quan trọng vào các dự án phát triển cộng đồng."'
                                : '"Mọi sự phát tâm đóng góp của quý vị đều được ghi nhận minh bạch tại Cổng Minh Bạch và góp phần quan trọng vào việc bảo tồn giá trị văn hóa Phật giáo."'
                            }
                        </p>
                        <Link href={isCompany ? '/du-an' : '/transactions'} className={cn(
                            "inline-flex items-center justify-center px-12 py-5 text-sm font-black transition-all duration-300 rounded-full hover:scale-105 uppercase tracking-[0.2em]",
                            isCompany
                                ? "text-[#002B5B] bg-[#FFD700] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]"
                                : "text-white bg-amber-600 hover:bg-amber-500 hover:shadow-[0_0_30px_rgba(217,119,6,0.4)]"
                        )}>
                            {isCompany ? 'Đóng góp dự án ngay' : 'Phát Tâm Đóng góp Ngay'}
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}

'use client';
import React from 'react';
import Image from 'next/image';

const GALLERY_IMAGES = [
    { src: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800', size: 'large', label: 'Lễ Đôn-ta' },
    { src: 'https://images.unsplash.com/photo-1596701062351-8c2c15119744?auto=format&fit=crop&q=80&w=800', size: 'small', label: 'Múa Chhay-dăm' },
    { src: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800', size: 'medium', label: 'Cúng Trăng' },
    { src: 'https://images.unsplash.com/photo-1560930950-5cc20e80e392?auto=format&fit=crop&q=80&w=800', size: 'medium', label: 'Tết Chol Chnam' },
    { src: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800', size: 'small', label: 'Dâng Y Kathina' },
    { src: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800', size: 'large', label: 'Đua Ghe Ngo' },
];

export function FestivalGallery() {
    return (
        <section className="py-24 px-6 sm:px-10 lg:px-16 overflow-hidden relative" style={{ backgroundColor: 'rgb(var(--theme-bg-start))' }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-[12px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full inline-block mb-4" style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.1)', color: 'rgb(var(--theme-text))' }}>Phum Sóc Rạng Ngời</span>
                    <h2 className="text-4xl lg:text-6xl font-black mb-6" style={{ color: 'rgb(var(--theme-text))' }}>Khoảnh Khắc Hội Hè</h2>
                </div>

                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {GALLERY_IMAGES.map((img, i) => (
                        <div key={i} className="group relative break-inside-avoid rounded-[2rem] overflow-hidden border border-white/5 transition-all duration-300">
                            <Image
                                src={img.src}
                                alt={img.label}
                                width={800}
                                height={img.size === 'large' ? 1000 : img.size === 'medium' ? 600 : 400}
                                className="w-full object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                                <span className="text-white font-black text-xl uppercase tracking-wider translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{img.label}</span>
                                <div className="w-12 h-1 bg-[#FFD700] mt-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-lg font-medium italic mb-10 opacity-70" style={{ color: 'rgb(var(--theme-text))' }}>
                        Mọi đóng góp, dù nhỏ bé, đều là nguồn động viên to lớn để gìn giữ bản sắc văn hóa dân tộc.
                    </p>
                    <a href="/transactions" className="px-12 py-5 rounded-2xl font-black text-white uppercase tracking-widest text-[14px] transition-all bg-[#FF4D6D] dark:bg-red-600">
                        Chung Tay Góp Sức
                    </a>
                </div>
            </div>
        </section>
    );
}

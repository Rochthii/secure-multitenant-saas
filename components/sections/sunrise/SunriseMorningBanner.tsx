'use client';
import React, { useEffect, useState } from 'react';

export function SunriseMorningBanner() {
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        const i = setInterval(() => {
            // Hiển thị giờ Việt Nam bất kể máy khách ở đâu
            setTimeStr(new Date().toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh'
            }));
        }, 1000);
        return () => clearInterval(i);
    }, []);

    return (
        <section className="py-12 sm:py-16 px-6 lg:px-16 flex items-center justify-between flex-wrap gap-8" style={{ backgroundColor: 'rgb(var(--theme-bg-end))', borderBottom: '1px solid rgb(var(--theme-primary) / 0.1)' }}>
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 border border-orange-100" style={{ backgroundColor: 'rgb(var(--theme-secondary))', color: 'rgb(var(--theme-primary))' }}>
                    🌅
                </div>
                <div>
                    <span className="text-[12px] font-bold tracking-widest uppercase mb-1 block" style={{ color: 'rgb(var(--theme-primary))' }}>Bây giờ là (ICT)</span>
                    <h2 className="text-2xl sm:text-4xl font-black font-mono tracking-tighter" style={{ color: 'rgb(var(--theme-text))' }}>{timeStr || '00:00'}</h2>
                </div>
            </div>
            <p className="max-w-md text-[14px] leading-relaxed font-medium" style={{ color: 'rgb(var(--theme-text) / 0.7)' }}>
                "Mỗi sáng mai thức dậy, ta có trọn 24 giờ tinh khôi để sống. Xin nguyện sống cho trọn vẹn và an lành."
            </p>
        </section>
    );
}

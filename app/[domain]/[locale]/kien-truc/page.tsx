import React from 'react';
import Image from 'next/image';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { Card } from '@/components/ui/card';

// Trang tĩnh hoàn toàn — không có DB call, build một lần duy nhất
export const dynamic = 'force-static';


const architectureFeatures = [
    {
        title: 'Chánh điện hai tầng',
        description: 'Kiến trúc độc đáo với hai tầng, tầng trên thờ Phật, tầng dưới là không gian lễ bái',
        image: '/images/chanh-dien.jpg',
    },
    {
        title: 'Rắn thần Naga',
        description: 'Biểu tượng của sự che chở, mưa thuận gió hòa, thịnh vượng trong văn hóa Khmer',
        image: '/images/naga.jpg',
    },
    {
        title: 'Chim thần Garuda',
        description: 'Tượng trưng cho sức mạnh, phương tiện của thần Vishnu trong thần thoại Hindu-Khmer',
        image: '/images/garuda.jpg',
    },
    {
        title: 'Hoa văn Pnhi-Phlerng',
        description: 'Họa tiết ngọn lửa đặc trưng trang trí mái chi nhánh và cột trụ',
        image: '/images/hoa-van.jpg',
    },
];

export default function ArchitecturePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <KhmerHeading level={1} withDivider className="text-center">
                Kiến trúc & Nghệ thuật Khmer
            </KhmerHeading>

            <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto mb-12">
                Chi nhánh Chantarangsay là một kiệt tác kiến trúc Khmer Nam tông, lưu giữ
                những nét đẹp tinh tế của nghệ thuật tạo hình dân tộc.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
                {architectureFeatures.map((feature, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="relative h-64 bg-gradient-to-br from-gold-primary/10 to-teal-accent/5">
                            {/* Placeholder until real images */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <span>{feature.title}</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-2xl font-playfair font-bold text-gold-primary mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import { TransactionPurposeSelector } from '@/components/donations/donation-purpose-selector';
import { TransactionForm } from '@/components/donations/donation-form';
import { RecentDonations } from '@/components/donations/recent-donations';
import { TransactionPurpose } from '@/lib/constants/transaction';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import { KhmerPatternBg } from '@/components/ui/khmer-pattern-bg';

import { RecentTransaction } from '@/lib/donations';

interface TransactionPageClientProps {
    purposes: TransactionPurpose[];
    recentTransactions: RecentTransaction[];
    tenantId: string;
    initialPurpose?: string;
    isCompany?: boolean;
}

export function DonationPageClient({ purposes, recentTransactions, tenantId, initialPurpose, isCompany }: TransactionPageClientProps) {
    // Default to initialPurpose if available, then 'general', then first purpose
    const defaultPurpose = initialPurpose || purposes.find(p => p.id === 'general')?.id || purposes[0]?.id || '';
    const [selectedPurpose, setSelectedPurpose] = useState<string>(defaultPurpose);

    return (
        <div className="container mx-auto px-4 py-12 -mt-20 relative z-10">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px] border border-gold-light/20">
                <div className="grid lg:grid-cols-12 gap-0">
                    {/* Left: Purpose & Info (Mobile: Top) */}
                    <div className="lg:col-span-7 p-6 md:p-8 lg:p-10 order-1 lg:order-1 bg-gradient-to-br from-gray-50 to-white">
                        <div className="mb-8">
                            <KhmerHeading level={2} className="text-left mb-2 text-gold-darker">
                                {isCompany ? 'Hạng mục đóng góp / Giải pháp' : 'Danh mục thanh toán'}
                            </KhmerHeading>
                            <p className="text-sm text-gray-500 mb-6">
                                {isCompany ? 'Quý vị có thể chọn hạng mục hỗ trợ cụ thể dưới đây' : 'Quý vị có thể chọn hạng mục gieo duyên cụ thể dưới đây'}
                            </p>
                        </div>

                        <TransactionPurposeSelector
                            purposes={purposes}
                            selectedPurpose={selectedPurpose}
                            onPurposeChange={setSelectedPurpose}
                        />


                    </div>

                    {/* Right: Form (Mobile: Bottom) */}
                    <div className="lg:col-span-5 relative order-2 lg:order-2">
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-gold-primary/5 z-0" />
                        <KhmerPatternBg className="z-0" />

                        <div className="relative z-10 p-6 md:p-8 lg:p-10 h-full border-l border-gold-light/20 bg-white/80 backdrop-blur-sm">
                            <div className="lg:sticky lg:top-8">
                                <div className="text-center mb-8">
                                    <div className="inline-block p-3 rounded-full bg-gold-primary/10 mb-4">
                                        <svg className="w-8 h-8 text-gold-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-playfair font-bold text-gold-darker mb-2">
                                        {isCompany ? 'Thông tin hỗ trợ' : 'Thông tin đóng góp'}
                                    </h2>
                                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                        {isCompany 
                                            ? 'Mọi đóng góp của quý vị đều được ghi nhận minh bạch phục vụ mục đích dự án.' 
                                            : 'Mọi đóng góp tịnh tài đều được Tam Bảo chứng minh và ghi nhận giao dịch'}
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-1 shadow-sm border border-gold-light/20">
                                    <TransactionForm
                                        purpose={selectedPurpose}
                                        purposeTitle={purposes.find(p => p.id === selectedPurpose)?.title}
                                        tenantId={tenantId}
                                    />
                                </div>

                                <div className="mt-8 text-center">
                                    <p className="text-xs text-gray-400 italic">
                                        * Hệ thống bảo mật thông tin và hỗ trợ thanh toán qua QR Code
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Recent Transactions (Full width) */}
                <div className="p-6 md:p-8 lg:p-10 border-t border-gold-light/20 bg-gray-50/50">
                    <div className="flex items-center justify-center text-center flex-col gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-gold-primary/10 flex items-center justify-center text-gold-primary mb-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-playfair font-bold text-gray-800 mb-2">
                                {isCompany ? 'Đóng góp mới nhất' : 'Giao dịch mới nhất'}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                {isCompany ? 'Danh sách các đối tác và cá nhân đã đồng hành cùng chúng tôi gần đây' : 'Danh sách thập phương thiện tín đã phát tâm thanh toán Tam Bảo gần đây'}
                            </p>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <RecentDonations transactions={recentTransactions} purposes={purposes} isCompany={isCompany} />
                    </div>
                </div>
            </div>
        </div>
    );
}

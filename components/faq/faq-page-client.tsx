'use client';

import React, { useState, useMemo } from 'react';
import { KhmerHeading } from '@/components/ui/khmer-heading';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type FAQ = {
    id: string;
    question_vi: string;
    question_km?: string | null;
    question_en?: string | null;
    answer_vi: string;
    answer_km?: string | null;
    answer_en?: string | null;
    category: string;
    display_order: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
};

type FAQPageClientProps = {
    faqs: FAQ[];
};

export function FAQPageClient({ faqs }: FAQPageClientProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Get unique categories
    const categories = useMemo(() => {
        const cats = Array.from(new Set(faqs.map((faq) => faq.category)));
        return ['all', ...cats];
    }, [faqs]);

    // Filter FAQs by category and search query
    const filteredFAQs = useMemo(() => {
        let filtered = faqs;

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((faq) => faq.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((faq) => {
                const questionMatch = faq.question_vi?.toLowerCase().includes(query) ||
                    faq.question_km?.toLowerCase().includes(query) ||
                    faq.question_en?.toLowerCase().includes(query);
                const answerMatch = faq.answer_vi?.toLowerCase().includes(query) ||
                    faq.answer_km?.toLowerCase().includes(query) ||
                    faq.answer_en?.toLowerCase().includes(query);
                return questionMatch || answerMatch;
            });
        }

        return filtered;
    }, [faqs, selectedCategory, searchQuery]);

    // Category display names
    const categoryNames: Record<string, string> = {
        all: 'Tất cả',
        general: 'Thông tin chung',
        rituals: 'Nghi lễ',
        transactions: 'Thanh toán',
        events: 'Sự kiện',
    };

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-8">
                <KhmerHeading level={1} withDivider>
                    Câu hỏi thường gặp
                </KhmerHeading>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                    Giải đáp các thắc mắc về chi nhánh, nghi lễ, và hoạt động Phật sự
                </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 py-6 text-base"
                    />
                </div>
                {searchQuery && (
                    <p className="mt-2 text-sm text-gray-600">
                        Tìm thấy <span className="font-semibold text-gold-primary">{filteredFAQs.length}</span> kết quả
                    </p>
                )}
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2 rounded-full transition-all ${selectedCategory === cat
                            ? 'bg-gold-primary text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {categoryNames[cat] || cat}
                    </button>
                ))}
            </div>

            {/* FAQ List */}
            {filteredFAQs.length > 0 ? (
                <div className="max-w-4xl mx-auto">
                    <Accordion type="single" collapsible className="space-y-4">
                        {filteredFAQs.map((faq) => (
                            <AccordionItem
                                key={faq.id}
                                value={faq.id}
                                className="bg-white rounded-lg border border-gray-200 px-6 py-2"
                            >
                                <AccordionTrigger className="text-left hover:no-underline">
                                    <span className="font-semibold text-gray-900">
                                        {faq.question_vi}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-700 leading-relaxed pt-2">
                                    {faq.answer_vi}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 text-lg">
                        {searchQuery
                            ? `Không tìm thấy câu hỏi nào phù hợp với "${searchQuery}"`
                            : 'Chưa có câu hỏi nào trong danh mục này'}
                    </p>
                </div>
            )}
        </div>
    );
}

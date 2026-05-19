'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ListIcon } from 'lucide-react';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents({ contentId }: { contentId: string }) {
    const [toc, setToc] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const container = document.getElementById(contentId);
        if (!container) return;

        const headingElements = container.querySelectorAll('h2, h3');
        const items: TOCItem[] = [];

        headingElements.forEach((el, index) => {
            const text = el.textContent || '';
            // Create ID if it doesn't exist
            if (!el.id) {
                el.id = `heading-${index}`;
            }
            items.push({
                id: el.id,
                text,
                level: parseInt(el.tagName.substring(1)),
            });
        });

        setToc(items);

        // Intersection Observer to highlight active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-10% 0% -80% 0%' }
        );

        headingElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [contentId]);

    if (toc.length === 0) return null;

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gold-primary/10 p-6 sticky top-32 mb-8">
            <div className="flex items-center gap-2 mb-4 text-coffee-dark">
                <ListIcon className="w-5 h-5 text-gold-primary" />
                <h3 className="font-playfair font-bold uppercase tracking-wider text-sm">Trong bài viết này</h3>
            </div>
            <nav className="space-y-2">
                {toc.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={cn(
                            "block text-sm transition-all duration-300 hover:text-gold-primary",
                            item.level === 3 ? "pl-4 text-xs" : "font-medium",
                            activeId === item.id 
                                ? "text-gold-primary border-l-2 border-gold-primary pl-3 -ml-[2px]" 
                                : "text-gray-500 border-l border-transparent pl-3"
                        )}
                    >
                        {item.text}
                    </a>
                ))}
            </nav>
        </div>
    );
}

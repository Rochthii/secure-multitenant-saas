'use client';

import { useEffect, useState } from 'react';

export function SkipToContent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleFocus = () => setIsVisible(true);
        const handleBlur = () => setIsVisible(false);

        const link = document.getElementById('skip-to-content');
        if (link) {
            link.addEventListener('focus', handleFocus);
            link.addEventListener('blur', handleBlur);

            return () => {
                link.removeEventListener('focus', handleFocus);
                link.removeEventListener('blur', handleBlur);
            };
        }
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const main = document.querySelector('main');
        if (main) {
            main.focus();
            main.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <a
            id="skip-to-content"
            href="#main-content"
            onClick={handleClick}
            className={`
        fixed top-0 left-0 z-[9999]
        px-4 py-2 bg-gold-primary text-white font-semibold
        transition-transform duration-200
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        focus:translate-y-0
      `}
        >
            Bỏ qua đến nội dung chính
        </a>
    );
}

'use client';

import React from 'react';
import { Facebook, Twitter, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareButtonsProps {
    title: string;
    url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
    const [copied, setCopied] = React.useState(false);

    const shareOnFacebook = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    const shareOnTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Đã sao chép liên kết!', {
                description: 'Bạn có thể dán liên kết này để chia sẻ.',
                duration: 3000,
            });
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Không thể sao chép liên kết');
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 mr-2">Chia sẻ:</span>

            <Button
                variant="outline"
                size="sm"
                onClick={shareOnFacebook}
                className="gap-2 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600"
            >
                <Facebook className="h-4 w-4" />
                <span className="hidden sm:inline">Facebook</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={shareOnTwitter}
                className="gap-2 hover:bg-sky-50 hover:border-sky-500 hover:text-sky-600"
            >
                <Twitter className="h-4 w-4" />
                <span className="hidden sm:inline">Twitter</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="gap-2 hover:bg-green-50 hover:border-green-500 hover:text-green-600"
            >
                {copied ? (
                    <>
                        <Check className="h-4 w-4" />
                        <span className="hidden sm:inline">Đã sao chép</span>
                    </>
                ) : (
                    <>
                        <LinkIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Sao chép link</span>
                    </>
                )}
            </Button>
        </div>
    );
}

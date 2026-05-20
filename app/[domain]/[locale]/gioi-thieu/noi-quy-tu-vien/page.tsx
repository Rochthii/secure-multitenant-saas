import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
    return { title: 'Giới thiệu' };
}

/**
 * Route /gioi-thieu/noi-quy-tu-vien — URL legacy của chùa.
 * Redirect về trang Giới thiệu chính để không trả về 404.
 */
export default async function LegacyRedirectPage({
    params,
}: {
    params: Promise<{ domain: string; locale: string }>;
}) {
    const { locale } = await params;
    redirect(`/${locale}/gioi-thieu`);
}

import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getTenantBaseUrl } from '@/lib/utils/seo';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const headersList = await headers();
    const domain = headersList.get('host') || '';
    const baseUrl = getTenantBaseUrl(domain);

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/login',
                ],
            },
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'CCBot',
                    'Amazonbot',
                    'ClaudeBot',
                    'Claude-Web',
                    'Bytespider',
                    'ImagesiftBot',
                    'cohere-ai',
                ],
                disallow: '/',
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

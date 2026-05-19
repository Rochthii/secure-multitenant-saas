/**
 * JSON-LD Structured Data Helper
 * Generates schema.org markup for SEO
 */

interface Organization {
    name: string;
    alternateName?: string;
    url: string;
    logo?: string;
    description?: string;
    address?: {
        '@type': 'PostalAddress';
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        addressCountry: string;
    };
    contactPoint?: {
        '@type': 'ContactPoint';
        telephone: string;
        contactType: string;
        email?: string;
    };
}

interface Event {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    location: {
        '@type': 'Place';
        name: string;
        address: string;
    };
    organizer?: {
        '@type': 'Organization';
        name: string;
    };
}

interface Article {
    headline: string;
    description: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    author?: {
        '@type': 'Organization' | 'Person';
        name: string;
    };
    publisher?: {
        '@type': 'Organization';
        name: string;
        logo?: {
            '@type': 'ImageObject';
            url: string;
        };
    };
}

export function generateOrganizationSchema(data: Organization) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ReligiousOrganization',
        '@id': data.url,
        name: data.name,
        alternateName: data.alternateName,
        url: data.url,
        logo: data.logo,
        description: data.description,
        address: data.address,
        contactPoint: data.contactPoint,
    });
}

export function generateEventSchema(data: Event, siteName: string = 'Chi nhánh Khmer') {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        organizer: data.organizer || {
            '@type': 'Organization',
            name: siteName,
        },
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
    });
}

export function generateArticleSchema(data: Article, siteName: string = 'Chi nhánh Khmer') {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.headline,
        description: data.description,
        image: data.image,
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        author: data.author || {
            '@type': 'Organization',
            name: siteName,
        },
        publisher: data.publisher || {
            '@type': 'Organization',
            name: siteName,
            logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
            },
        },
    });
}

export function generatePlaceSchema(siteName: string = 'Chi nhánh Khmer', address?: Record<string, string>, geo?: Record<string, number>) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Place',
        '@id': process.env.NEXT_PUBLIC_SITE_URL,
        name: siteName,
        alternateName: 'Khmer Pagoda',
        description: 'Ngôi chi nhánh Phật giáo Nam tông Khmer',
        address: {
            '@type': 'PostalAddress',
            streetAddress: address?.streetAddress || '',
            addressLocality: address?.addressLocality || '',
            addressRegion: address?.addressRegion || '',
            addressCountry: address?.addressCountry || 'VN',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: geo?.latitude || 10.7756,
            longitude: geo?.longitude || 106.6946,
        },
        url: process.env.NEXT_PUBLIC_SITE_URL,
    });
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    });
}

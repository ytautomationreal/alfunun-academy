import { siteConfig, faqData } from '@/lib/seo';

// ============================================
// ORGANIZATION SCHEMA
// ============================================
export function OrganizationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        description: siteConfig.description,
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: siteConfig.contact.phone,
            contactType: 'customer service',
            email: siteConfig.contact.email,
            availableLanguage: ['English', 'Urdu'],
        },
        sameAs: [
            siteConfig.social.facebook,
            siteConfig.social.instagram,
            siteConfig.social.youtube,
            siteConfig.social.twitter,
        ],
        address: {
            '@type': 'PostalAddress',
            streetAddress: siteConfig.contact.address.street,
            addressLocality: siteConfig.contact.address.city,
            addressRegion: siteConfig.contact.address.state,
            postalCode: siteConfig.contact.address.postalCode,
            addressCountry: siteConfig.contact.address.country,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ============================================
// LOCAL BUSINESS SCHEMA (For Google Maps)
// ============================================
export function LocalBusinessSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        telephone: siteConfig.contact.phone,
        email: siteConfig.contact.email,
        description: siteConfig.description,
        image: `${siteConfig.url}/og-image.png`,
        priceRange: '$$',
        address: {
            '@type': 'PostalAddress',
            streetAddress: siteConfig.contact.address.street,
            addressLocality: siteConfig.contact.address.city,
            addressRegion: siteConfig.contact.address.state,
            postalCode: siteConfig.contact.address.postalCode,
            addressCountry: 'PK',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: '31.5204', // Update with actual coordinates
            longitude: '74.3587',
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '18:00',
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Saturday',
                opens: '10:00',
                closes: '16:00',
            },
        ],
        sameAs: [
            siteConfig.social.facebook,
            siteConfig.social.instagram,
            siteConfig.social.youtube,
        ],
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '50',
            bestRating: '5',
            worstRating: '1',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ============================================
// FAQ SCHEMA (For Rich Results)
// ============================================
export function FAQSchema({ faqs = faqData }: { faqs?: { question: string; answer: string }[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ============================================
// COURSE SCHEMA
// ============================================
export function CourseSchema({
    name,
    description,
    duration = '3 months',
    price = 'Contact for pricing'
}: {
    name: string;
    description: string;
    duration?: string;
    price?: string;
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name,
        description,
        provider: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
        },
        hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'onsite',
            duration,
            inLanguage: 'en',
            offers: {
                '@type': 'Offer',
                price,
                priceCurrency: 'PKR',
            },
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ============================================
// BREADCRUMB SCHEMA
// ============================================
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ============================================
// WEBPAGE SCHEMA
// ============================================
export function WebPageSchema({
    title,
    description,
    url
}: {
    title: string;
    description: string;
    url: string;
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url,
        isPartOf: {
            '@type': 'WebSite',
            name: siteConfig.name,
            url: siteConfig.url,
        },
        publisher: {
            '@type': 'Organization',
            name: siteConfig.name,
            url: siteConfig.url,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// ============================================
// SPEAKABLE SCHEMA (For Voice Search & AI)
// ============================================
export function SpeakableSchema({ cssSelectors = ['h1', '.hero-text', '.faq-answer'] }: { cssSelectors?: string[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: cssSelectors,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

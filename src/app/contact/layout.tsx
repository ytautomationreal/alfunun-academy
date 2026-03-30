import { Metadata } from 'next';
import { siteConfig, pageMetadata } from '@/lib/seo';

// ============================================
// PAGE METADATA
// ============================================
export const metadata: Metadata = {
    ...pageMetadata.contact,
    alternates: {
        canonical: `${siteConfig.url}/contact`,
    },
    openGraph: {
        title: pageMetadata.contact.title as string,
        description: pageMetadata.contact.description as string,
        url: `${siteConfig.url}/contact`,
        siteName: siteConfig.name,
        type: 'website',
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

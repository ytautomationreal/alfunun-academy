import { Metadata } from 'next';
import { siteConfig, pageMetadata } from '@/lib/seo';

// ============================================
// PAGE METADATA
// ============================================
export const metadata: Metadata = {
    ...pageMetadata.admission,
    alternates: {
        canonical: `${siteConfig.url}/admission`,
    },
    openGraph: {
        title: pageMetadata.admission.title as string,
        description: pageMetadata.admission.description as string,
        url: `${siteConfig.url}/admission`,
        siteName: siteConfig.name,
        type: 'website',
    },
};

export default function AdmissionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

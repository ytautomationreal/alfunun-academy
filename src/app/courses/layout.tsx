import { Metadata } from 'next';
import { siteConfig, pageMetadata } from '@/lib/seo';

// ============================================
// PAGE METADATA
// ============================================
export const metadata: Metadata = {
    ...pageMetadata.courses,
    alternates: {
        canonical: `${siteConfig.url}/courses`,
    },
    openGraph: {
        title: pageMetadata.courses.title as string,
        description: pageMetadata.courses.description as string,
        url: `${siteConfig.url}/courses`,
        siteName: siteConfig.name,
        type: 'website',
    },
};

export default function CoursesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

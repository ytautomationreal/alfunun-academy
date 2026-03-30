import { Metadata } from 'next';
import Gallery3D from "@/components/home/Gallery3D";
import { siteConfig, pageMetadata } from '@/lib/seo';
import { WebPageSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

// ============================================
// PAGE METADATA
// ============================================
export const metadata: Metadata = {
    ...pageMetadata.gallery,
    alternates: {
        canonical: `${siteConfig.url}/gallery`,
    },
    openGraph: {
        title: pageMetadata.gallery.title as string,
        description: pageMetadata.gallery.description as string,
        url: `${siteConfig.url}/gallery`,
        siteName: siteConfig.name,
        type: 'website',
    },
};

export default function GalleryPage() {
    return (
        <>
            {/* Structured Data */}
            <WebPageSchema
                title={pageMetadata.gallery.title as string}
                description={pageMetadata.gallery.description as string}
                url={`${siteConfig.url}/gallery`}
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: siteConfig.url },
                    { name: 'Gallery', url: `${siteConfig.url}/gallery` }
                ]}
            />

            <main className="min-h-screen bg-[#050505]">
                {/* SEO H1 */}
                <div className="container pt-24 pb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Student <span className="text-gradient">Gallery</span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Explore the amazing projects, activities, and achievements of our talented students at Alfunun Academy.
                    </p>
                </div>

                <Gallery3D />
            </main>
        </>
    );
}

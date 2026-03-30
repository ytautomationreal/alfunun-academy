import { Metadata } from 'next';
import Hero from "@/components/home/Hero";
import TechMarquee from "@/components/home/TechMarquee";
import BentoGrid from "@/components/home/BentoGrid";
import StatsCounter from "@/components/home/StatsCounter";
import CourseCarousel from "@/components/home/CourseCarousel";
import GoogleReviews from "@/components/home/GoogleReviews";
import Team from "@/components/home/Team";
import Gallery3D from "@/components/home/Gallery3D";
import Contact from "@/components/home/Contact";
import ScrollToTop from "@/components/ScrollToTop";
import { siteConfig, pageMetadata } from '@/lib/seo';
import { WebPageSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

// ============================================
// PAGE METADATA
// ============================================
export const metadata: Metadata = {
  ...pageMetadata.home,
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function Home() {
  return (
    <>
      {/* Structured Data */}
      <WebPageSchema
        title={pageMetadata.home.title as string}
        description={pageMetadata.home.description as string}
        url={siteConfig.url}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: siteConfig.url }
        ]}
      />

      <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <ScrollToTop />

        {/* Hero Section with H1 */}
        <Hero />

        {/* Trust Signals */}
        <TechMarquee />

        {/* Why Choose Us - Features */}
        <BentoGrid />

        {/* Social Proof - Stats */}
        <StatsCounter />

        {/* Courses - Main Offering */}
        <CourseCarousel />

        {/* Team - E-E-A-T Signal */}
        <Team />

        {/* Gallery - Social Proof */}
        <Gallery3D />

        {/* Reviews - Trust Signal */}
        <GoogleReviews />

        {/* Contact - Conversion */}
        <Contact />
      </main>
    </>
  );
}

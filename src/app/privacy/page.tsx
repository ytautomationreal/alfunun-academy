import { Metadata } from 'next';
import { siteConfig, pageMetadata } from '@/lib/seo';
import { WebPageSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

// ============================================
// PAGE METADATA
// ============================================
export const metadata: Metadata = {
    ...pageMetadata.privacy,
    alternates: {
        canonical: `${siteConfig.url}/privacy`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function PrivacyPage() {
    const lastUpdated = 'January 1, 2026';

    return (
        <>
            {/* Structured Data */}
            <WebPageSchema
                title={pageMetadata.privacy.title as string}
                description={pageMetadata.privacy.description as string}
                url={`${siteConfig.url}/privacy`}
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: siteConfig.url },
                    { name: 'Privacy Policy', url: `${siteConfig.url}/privacy` }
                ]}
            />

            <main className="min-h-screen pt-24 pb-20">
                <article className="container px-4 md:px-6 max-w-4xl mx-auto prose prose-invert">
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-zinc-400 mb-8">Last Updated: {lastUpdated}</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            Welcome to {siteConfig.name} ("we," "our," or "us"). We are committed to protecting
                            your personal information and your right to privacy. This Privacy Policy explains
                            how we collect, use, disclose, and safeguard your information when you visit our
                            website or use our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Personal identification information (name, email address, phone number)</li>
                            <li>Educational background and qualifications</li>
                            <li>Course enrollment and attendance records</li>
                            <li>Payment and billing information</li>
                            <li>Communications and feedback you send to us</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">We use the information we collect to:</p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Process your course enrollment and manage your student account</li>
                            <li>Communicate with you about courses, schedules, and updates</li>
                            <li>Process payments and send invoices</li>
                            <li>Improve our services and develop new features</li>
                            <li>Send promotional communications (with your consent)</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            We do not sell, trade, or rent your personal information to third parties.
                            We may share your information only in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2 mt-4">
                            <li>With your consent or at your direction</li>
                            <li>To comply with legal requirements</li>
                            <li>To protect our rights and safety</li>
                            <li>With service providers who assist in our operations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            We implement appropriate technical and organizational security measures to protect
                            your personal information against unauthorized access, alteration, disclosure, or
                            destruction. However, no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">You have the right to:</p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate or incomplete data</li>
                            <li>Request deletion of your data</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-white/10">
                            <p className="text-zinc-300"><strong>Email:</strong> {siteConfig.contact.email}</p>
                            <p className="text-zinc-300"><strong>Phone:</strong> {siteConfig.contact.phone}</p>
                            <p className="text-zinc-300"><strong>Address:</strong> {siteConfig.contact.address.street}, {siteConfig.contact.address.city}</p>
                        </div>
                    </section>
                </article>
            </main>
        </>
    );
}

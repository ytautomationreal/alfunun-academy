import { Metadata } from 'next';
import { siteConfig, pageMetadata } from '@/lib/seo';
import { WebPageSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

// ============================================
// PAGE METADATA
// ============================================
export const metadata: Metadata = {
    ...pageMetadata.terms,
    alternates: {
        canonical: `${siteConfig.url}/terms`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function TermsPage() {
    const lastUpdated = 'January 1, 2026';

    return (
        <>
            {/* Structured Data */}
            <WebPageSchema
                title={pageMetadata.terms.title as string}
                description={pageMetadata.terms.description as string}
                url={`${siteConfig.url}/terms`}
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: siteConfig.url },
                    { name: 'Terms of Service', url: `${siteConfig.url}/terms` }
                ]}
            />

            <main className="min-h-screen pt-24 pb-20">
                <article className="container px-4 md:px-6 max-w-4xl mx-auto prose prose-invert">
                    <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-zinc-400 mb-8">Last Updated: {lastUpdated}</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            By accessing and using the services provided by {siteConfig.name}, you agree to
                            be bound by these Terms of Service. If you do not agree to these terms, please
                            do not use our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Services Provided</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            {siteConfig.name} provides computer training and IT education services, including
                            but not limited to courses in web development, graphic design, digital marketing,
                            and office automation. Course availability, schedules, and content may change
                            without prior notice.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. Enrollment and Fees</h2>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Enrollment is subject to availability and completion of the admission process</li>
                            <li>All fees must be paid as per the agreed schedule</li>
                            <li>Admission fees are non-refundable once the student has attended classes</li>
                            <li>Monthly fees are due at the beginning of each month</li>
                            <li>Late payment may result in suspension of access to classes</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Student Responsibilities</h2>
                        <p className="text-zinc-300 leading-relaxed mb-4">As a student, you agree to:</p>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Attend classes regularly and on time</li>
                            <li>Complete assignments and projects as required</li>
                            <li>Treat instructors and fellow students with respect</li>
                            <li>Not engage in any form of harassment or discrimination</li>
                            <li>Not copy, distribute, or share course materials without permission</li>
                            <li>Take care of academy property and equipment</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            All course materials, including but not limited to presentations, videos, code
                            samples, and documentation, are the intellectual property of {siteConfig.name}.
                            These materials may not be reproduced, distributed, or used for commercial
                            purposes without written permission.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Certificates</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            Certificates are awarded upon successful completion of a course, which includes
                            meeting attendance requirements and passing any required assessments. Certificates
                            are for personal use and verification of skills acquired at {siteConfig.name}.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Refund Policy</h2>
                        <ul className="list-disc pl-6 text-zinc-300 space-y-2">
                            <li>Admission fee is non-refundable after attending first class</li>
                            <li>Monthly fee refunds are considered on a case-by-case basis</li>
                            <li>No refund will be given for partial month attendance</li>
                            <li>Refund requests must be submitted in writing</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            {siteConfig.name} is not liable for any indirect, incidental, or consequential
                            damages arising from the use of our services. We do not guarantee employment
                            or specific outcomes after course completion.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            We reserve the right to modify these Terms of Service at any time. Changes will
                            be effective immediately upon posting on our website. Continued use of our
                            services constitutes acceptance of the modified terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
                        <p className="text-zinc-300 leading-relaxed">
                            For questions regarding these Terms of Service, please contact us:
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

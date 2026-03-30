import { Metadata } from 'next';
import { siteConfig, pageMetadata, faqData } from '@/lib/seo';
import { WebPageSchema, BreadcrumbSchema, FAQSchema } from '@/components/seo/JsonLd';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Award, Users, BookOpen, Briefcase } from 'lucide-react';

// ============================================
// PAGE METADATA
// ============================================
export const metadata: Metadata = {
    ...pageMetadata.about,
    alternates: {
        canonical: `${siteConfig.url}/about`,
    },
    openGraph: {
        title: pageMetadata.about.title as string,
        description: pageMetadata.about.description as string,
        url: `${siteConfig.url}/about`,
        siteName: siteConfig.name,
        type: 'website',
    },
};

const features = [
    {
        icon: Target,
        title: 'Our Mission',
        description: 'To provide accessible, high-quality IT education that empowers individuals to excel in the digital economy and transform their careers.',
    },
    {
        icon: Eye,
        title: 'Our Vision',
        description: 'To become the leading computer training institute in Pakistan, known for producing skilled professionals who drive innovation.',
    },
    {
        icon: Award,
        title: 'Our Values',
        description: 'Excellence, integrity, innovation, and student success are at the core of everything we do at Alfunun Academy.',
    },
];

const stats = [
    { icon: Users, value: '500+', label: 'Students Trained' },
    { icon: BookOpen, value: '15+', label: 'Courses Offered' },
    { icon: Briefcase, value: '200+', label: 'Job Placements' },
    { icon: Award, value: '5+', label: 'Years Experience' },
];

export default function AboutPage() {
    return (
        <>
            {/* Structured Data */}
            <WebPageSchema
                title={pageMetadata.about.title as string}
                description={pageMetadata.about.description as string}
                url={`${siteConfig.url}/about`}
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: siteConfig.url },
                    { name: 'About Us', url: `${siteConfig.url}/about` }
                ]}
            />
            <FAQSchema faqs={faqData} />

            <main className="min-h-screen pt-24 pb-20">
                {/* Hero Section */}
                <section className="container px-4 md:px-6 mb-16">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            About <span className="text-gradient">Alfunun Academy</span>
                        </h1>
                        <p className="text-zinc-400 text-lg leading-relaxed">
                            Alfunun Academy is a premier computer training institute dedicated to
                            providing world-class IT education. Located in {siteConfig.contact.address.city},
                            we have been transforming lives through technology education since our inception.
                        </p>
                    </div>
                </section>

                {/* Mission, Vision, Values */}
                <section className="container px-4 md:px-6 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="bg-zinc-900/50 border-white/5 hover:border-cyan-500/30 transition-colors">
                                <CardContent className="p-6 text-center">
                                    <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                                        <feature.icon className="w-7 h-7 text-cyan-400" />
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 text-white">{feature.title}</h2>
                                    <p className="text-zinc-400">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Stats */}
                <section className="container px-4 md:px-6 mb-16">
                    <div className="bg-zinc-900/30 rounded-2xl p-8 border border-white/5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-zinc-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="container px-4 md:px-6 mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">
                        Why Choose <span className="text-gradient">Alfunun Academy</span>?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div className="flex gap-4">
                            <div className="w-2 bg-cyan-500 rounded-full" />
                            <div>
                                <h3 className="font-semibold text-white mb-2">Expert Instructors</h3>
                                <p className="text-zinc-400">Learn from industry professionals with years of real-world experience.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 bg-purple-500 rounded-full" />
                            <div>
                                <h3 className="font-semibold text-white mb-2">Hands-On Training</h3>
                                <p className="text-zinc-400">Practical, project-based learning approach for real skill development.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 bg-emerald-500 rounded-full" />
                            <div>
                                <h3 className="font-semibold text-white mb-2">Job Placement Support</h3>
                                <p className="text-zinc-400">Career guidance and placement assistance for all graduating students.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 bg-orange-500 rounded-full" />
                            <div>
                                <h3 className="font-semibold text-white mb-2">Affordable Fees</h3>
                                <p className="text-zinc-400">Quality education at reasonable prices with flexible payment plans.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section for AI/Rich Results */}
                <section className="container px-4 md:px-6">
                    <h2 className="text-3xl font-bold text-center mb-8">
                        Frequently Asked <span className="text-gradient">Questions</span>
                    </h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqData.map((faq, index) => (
                            <Card key={index} className="bg-zinc-900/50 border-white/5">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-white mb-2 faq-question">{faq.question}</h3>
                                    <p className="text-zinc-400 faq-answer">{faq.answer}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}

import { Metadata } from 'next';

// ============================================
// SITE CONFIGURATION - Update these values
// ============================================
export const siteConfig = {
    name: 'Alfunun Academy',
    tagline: 'Code Your Future',
    description: 'Alfunun Academy is a premier computer training institute offering professional courses in Web Development, Graphic Design, Digital Marketing, and Office Automation. Join us to future-proof your skills with expert mentors and modern facilities.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://alfunun.com',

    // Contact Information (NAP - Name, Address, Phone)
    contact: {
        phone: '+92-XXX-XXXXXXX', // Update with actual phone
        email: 'info@alfunun.com',
        address: {
            street: 'Main Boulevard', // Update with actual address
            city: 'Lahore',
            state: 'Punjab',
            country: 'Pakistan',
            postalCode: '54000',
        },
    },

    // Social Media
    social: {
        facebook: 'https://facebook.com/alfununacademy',
        instagram: 'https://instagram.com/alfununacademy',
        youtube: 'https://youtube.com/@alfununacademy',
        twitter: 'https://twitter.com/alfununacademy',
        whatsapp: '+92-XXX-XXXXXXX',
    },

    // Business Hours
    hours: {
        weekdays: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed',
    },

    // Keywords
    keywords: [
        'computer courses',
        'IT training',
        'web development course',
        'graphic design course',
        'digital marketing course',
        'computer institute',
        'programming classes',
        'Lahore',
        'Pakistan',
    ],
};

// ============================================
// PAGE METADATA CONFIGURATIONS
// ============================================
export const pageMetadata: Record<string, Metadata> = {
    home: {
        title: `${siteConfig.name} - Best Computer Training Institute in ${siteConfig.contact.address.city}`,
        description: `${siteConfig.description} Located in ${siteConfig.contact.address.city}, ${siteConfig.contact.address.country}.`,
        keywords: siteConfig.keywords,
    },
    courses: {
        title: `Computer Courses & IT Training Programs | ${siteConfig.name}`,
        description: 'Explore our professional computer courses including Web Development, Graphic Design, Digital Marketing, Office Automation, and more. Enroll now and start your tech career!',
        keywords: ['computer courses', 'IT training', 'web development', 'graphic design', 'programming'],
    },
    gallery: {
        title: `Student Gallery & Projects | ${siteConfig.name}`,
        description: 'View our student projects, classroom activities, and success stories. See what our students have achieved at Alfunun Academy.',
        keywords: ['student gallery', 'projects', 'portfolio', 'student work'],
    },
    admission: {
        title: `Apply Now - Admissions Open 2026 | ${siteConfig.name}`,
        description: 'New admissions are now open at Alfunun Academy! Apply today for computer courses in Web Development, Graphic Design, and more. Limited seats available.',
        keywords: ['admission', 'apply now', 'enrollment', 'registration'],
    },
    contact: {
        title: `Contact Us - Get in Touch | ${siteConfig.name}`,
        description: `Contact Alfunun Academy for inquiries about our courses. Visit us at ${siteConfig.contact.address.street}, ${siteConfig.contact.address.city} or call ${siteConfig.contact.phone}.`,
        keywords: ['contact', 'location', 'phone', 'address'],
    },
    about: {
        title: `About Us - Our Story & Mission | ${siteConfig.name}`,
        description: 'Learn about Alfunun Academy, our mission to provide quality IT education, our expert mentors, and our commitment to student success.',
        keywords: ['about us', 'our story', 'mission', 'vision'],
    },
    privacy: {
        title: `Privacy Policy | ${siteConfig.name}`,
        description: 'Read our privacy policy to understand how we collect, use, and protect your personal information at Alfunun Academy.',
        keywords: ['privacy policy', 'data protection'],
    },
    terms: {
        title: `Terms of Service | ${siteConfig.name}`,
        description: 'Review the terms and conditions for using Alfunun Academy services and website.',
        keywords: ['terms of service', 'terms and conditions'],
    },
};

// ============================================
// METADATA GENERATOR HELPER
// ============================================
export function generateMetadata(page: keyof typeof pageMetadata): Metadata {
    const meta = pageMetadata[page];
    const baseUrl = siteConfig.url;

    return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        authors: [{ name: siteConfig.name }],
        creator: siteConfig.name,
        publisher: siteConfig.name,

        // Canonical URL
        alternates: {
            canonical: baseUrl,
        },

        // OpenGraph
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url: baseUrl,
            siteName: siteConfig.name,
            title: meta.title as string,
            description: meta.description as string,
            images: [
                {
                    url: `${baseUrl}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: siteConfig.name,
                },
            ],
        },

        // Twitter Card
        twitter: {
            card: 'summary_large_image',
            title: meta.title as string,
            description: meta.description as string,
            images: [`${baseUrl}/og-image.png`],
            creator: '@alfununacademy',
        },

        // Robots
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        // Verification (add your codes)
        verification: {
            google: 'your-google-verification-code',
            // yandex: 'your-yandex-code',
            // bing: 'your-bing-code',
        },
    };
}

// ============================================
// FAQ DATA FOR SCHEMA
// ============================================
export const faqData = [
    {
        question: 'What courses does Alfunun Academy offer?',
        answer: 'We offer professional courses in Web Development, Graphic Design, Digital Marketing, Office Automation, Basic Computer Skills, and more.',
    },
    {
        question: 'How long are the courses?',
        answer: 'Course duration varies from 1 month to 6 months depending on the program. Our team can help you choose the right course for your goals.',
    },
    {
        question: 'Do you provide certificates?',
        answer: 'Yes, all students receive a professional certificate upon successful completion of their course.',
    },
    {
        question: 'What are the class timings?',
        answer: `Classes are available during ${siteConfig.hours.weekdays} on weekdays and ${siteConfig.hours.saturday} on Saturdays. We offer flexible batch timings.`,
    },
    {
        question: 'Is there any age limit for enrollment?',
        answer: 'No, there is no age limit. Students of all ages are welcome to join our courses based on their interest and goals.',
    },
    {
        question: 'Do you offer job placement assistance?',
        answer: 'Yes, we provide career guidance and job placement assistance to help our students start their professional careers.',
    },
];

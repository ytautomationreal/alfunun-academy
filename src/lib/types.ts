export interface Student {
    _id: number; // MySQL ID is number, aliased as _id for compatibility
    id?: number;
    name: string;
    fatherName: string;
    cnic: string;
    phone: string;
    course: string;
    address: string;
    admissionFeeStatus: 'Paid' | 'Unpaid' | 'Partial';
    monthlyFeeStatus: 'Paid' | 'Unpaid' | 'Partial';
    admissionFeeAmount: number;
    monthlyFeeAmount: number;
    admissionFeePaid?: number;
    monthlyFeePaid?: number;
    base_monthly_fee?: number;
    admissionDate: string;
    image_url?: string;

    batch?: string;
    pc_number?: number;
    status?: 'active' | 'left' | 'graduated';
    leftDate?: string;
}

export interface GalleryImage {
    id: number;
    title: string;
    category: string;
    imageUrl: string;
    video_url?: string;
    createdAt: string;
}

export interface Review {
    id: number;
    name: string;
    rating: number;
    reviewText: string;
    timeAgo: string;
    reviewLink: string;
    imageUrl: string;
    createdAt: string;
}

export interface Course {
    id: number;
    title: string;
    description: string;
    duration: string;
    price: string;
    icon: string;
    color: string;
    category: string;
    sort_order?: number;
    created_at?: string;
}

export interface SiteSettings {
    hero_title?: string;
    hero_subtitle?: string;
    hero_admission_banner?: string;
    contact_phone?: string;
    contact_email?: string;
    contact_address?: string;
    stats_students?: string;
    stats_mentors?: string;
    stats_job_success?: string;
    stats_batches?: string;
    theme_primary?: string;
    theme_secondary?: string;
    team_image_shape?: 'square' | 'rounded' | 'circle';
    team_text_align?: 'left' | 'center';
    hero_show_spotlight?: string;
    hero_particle_count?: string;
    hero_particle_size?: string;
    hero_interaction_mode?: string;
    hero_interaction_strength?: string;
    [key: string]: string | undefined;
}

export interface Feature {
    id: number;
    title: string;
    description: string;
    icon: string;
    col_span: string;
    bg_class: string;
    sort_order: number;
}

export interface Technology {
    id: number;
    name: string;
    icon: string;
    image_url?: string;
}

export interface Teacher {
    id: number;
    name: string;
    role: string;
    imageUrl?: string;
    bio?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
    sort_order?: number;
}

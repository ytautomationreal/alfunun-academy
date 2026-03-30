"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Review } from "@/lib/types";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Placeholder Google Logo (SVG)
const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

const GOOGLE_MAPS_LINK = "https://share.google/A4gvqtv3niflyETSs";

export default function GoogleReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch("/api/reviews");
                const data = await res.json();
                if (data.success) {
                    setReviews(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            }
        };
        fetchReviews();
    }, []);

    // Embla Carousel Setup
    const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
        Autoplay({ delay: 4000, stopOnInteraction: false }),
    ]);

    // If no reviews, hide the section
    if (reviews.length === 0) return null;

    return (
        <section className="py-20 bg-zinc-900/30 border-y border-white/5 overflow-hidden">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <GoogleLogo />
                        <span className="text-xl font-bold text-white">Google Reviews</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                        What Our Students Say
                    </h2>
                </div>

                <div className="relative" ref={emblaRef}>
                    <div className="flex -ml-6">
                        {reviews.map((review, index) => (
                            <div className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-6" key={review.id}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="h-full"
                                >
                                    <Link href={review.reviewLink || GOOGLE_MAPS_LINK} target="_blank" rel="noopener noreferrer" className="block h-full">
                                        <Card className="h-full border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors cursor-pointer group flex flex-col justify-between">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                                            <Image
                                                                src={review.imageUrl}
                                                                alt={review.name}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors line-clamp-1">{review.name}</h4>
                                                            <p className="text-xs text-zinc-500">{review.timeAgo}</p>
                                                        </div>
                                                    </div>
                                                    <GoogleLogo />
                                                </div>

                                                <div className="flex gap-0.5 mb-3">
                                                    {[...Array(review.rating)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    ))}
                                                </div>

                                                <p className="text-zinc-300 text-sm leading-relaxed line-clamp-4">"{review.reviewText}"</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-12">
                    <Link href={GOOGLE_MAPS_LINK} target="_blank" rel="noopener noreferrer">
                        <button className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors text-sm font-medium">
                            See all reviews on Google Maps
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

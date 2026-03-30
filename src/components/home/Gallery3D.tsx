"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowLeft, ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import { GalleryImage } from "@/lib/types";

export default function Gallery3D() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    // Fetch images
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch("/api/gallery");
                const data = await res.json();
                if (data.success && data.data.length > 0) {
                    let galleryData = data.data;
                    // Ensure enough items for smooth infinite loop (at least 7 for cushion)
                    if (galleryData.length < 7) {
                        const multiplier = Math.ceil(7 / galleryData.length);
                        galleryData = Array(multiplier).fill(galleryData).flat().map((item: GalleryImage, index: number) => ({
                            ...item,
                            id: `${item.id}-${index}` // Unique IDs for duplicates
                        }));
                    }
                    setImages(galleryData);
                    setActiveIndex(Math.floor(galleryData.length / 2));
                }
            } catch (error) {
                console.error("Failed to load gallery:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    const nextImage = useCallback(() => {
        if (images.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        if (images.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
    }, [nextImage, prevImage]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Circular distance calculation
    const getDistance = (index: number) => {
        const length = images.length;
        if (length === 0) return 0;
        let diff = (index - activeIndex + length) % length;
        if (diff > length / 2) diff -= length;
        return diff;
    };

    if (loading) {
        return (
            <div className="min-h-[600px] flex items-center justify-center w-full">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
            </div>
        );
    }

    return (
        <section className="relative w-full py-10 overflow-hidden flex flex-col items-center justify-center">

            <div className="flex flex-col items-center text-center mb-6 gap-4 relative z-10 px-4">
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Student Gallery</h2>
                <p className="text-zinc-400 max-w-xl mx-auto">
                    A glimpse into the life and achievements at Alfunun Academy.
                </p>
            </div>

            {/* 3D Carousel Container */}
            <div className="relative w-full h-[500px] flex items-center justify-center perspective-[1000px]">
                {images.map((img, index) => {
                    const dist = getDistance(index);
                    const absDist = Math.abs(dist);
                    const isActive = dist === 0;
                    const isVisible = absDist <= 2;

                    const translateX = `calc(-50% + ${dist * 55}%)`;
                    const scale = isActive ? 1 : Math.max(0.6, 1 - (absDist * 0.15));
                    const zIndex = 100 - absDist;
                    const opacity = isVisible ? (isActive ? 1 : 0.6) : 0;
                    const blur = isActive ? 0 : absDist * 3;
                    const brightness = isActive ? 1 : 0.4;

                    return (
                        <div
                            key={img.id}
                            className={`absolute top-1/2 left-1/2 w-[85vw] max-w-[300px] md:w-[500px] md:max-w-none aspect-[4/3] rounded-3xl shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] cursor-pointer overflow-hidden bg-black select-none border border-white/5`}
                            style={{
                                transform: `translate3d(${translateX}, -50%, ${-absDist * 60}px) scale(${scale})`,
                                zIndex: zIndex,
                                opacity: opacity,
                                filter: `brightness(${brightness}) blur(${blur}px)`,
                                pointerEvents: isVisible ? 'auto' : 'none'
                            }}
                            onClick={() => {
                                if (dist !== 0) {
                                    if (dist > 0) nextImage();
                                    else prevImage();
                                } else if (img.video_url) {
                                    window.open(img.video_url, '_blank');
                                }
                            }}
                        >
                            <Image
                                src={img.imageUrl}
                                alt="Gallery Image"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority={isActive || absDist === 1}
                                draggable={false}
                            />
                            {img.video_url && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-xl group-hover:scale-110 transition-transform">
                                        <Play className="w-8 h-8 text-white fill-current" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Floating Navigation Buttons */}
            <div className="absolute bottom-10 flex gap-6 z-50">
                <button
                    onClick={prevImage}
                    className="group relative px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:scale-105 transition-all flex items-center gap-2 backdrop-blur-md active:scale-95 duration-200"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Previous</span>
                </button>
                <div className="w-px h-10 bg-white/10 mx-2"></div>
                <button
                    onClick={nextImage}
                    className="group relative px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:scale-105 transition-all flex items-center gap-2 backdrop-blur-md active:scale-95 duration-200"
                >
                    <span className="text-sm font-medium">Next</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </section>
    );
}

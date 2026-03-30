"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type SpotlightProps = {
    className?: string;
    fill?: string;
};

export const Spotlight = ({ className, fill = "white" }: SpotlightProps) => {
    return (
        <svg
            className={cn(
                "animate-spotlight pointer-events-none absolute z-[1]  h-[169%] w-[138%] lg:w-[84%] opacity-0",
                className
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 3787 2842"
            fill="none"
        >
            <g filter="url(#filter0_f_107_743)">
                <ellipse
                    cx="1924.71"
                    cy="273.501"
                    rx="1924.71"
                    ry="273.501"
                    transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
                    fill={fill}
                    fillOpacity="0.21"
                ></ellipse>
            </g>
            <defs>
                <filter
                    id="filter0_f_107_743"
                    x="0.860352"
                    y="0.838989"
                    width="3785.16"
                    height="2840.26"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                    ></feBlend>
                    <feGaussianBlur
                        stdDeviation="151"
                        result="effect1_foregroundBlur_107_743"
                    ></feGaussianBlur>
                </filter>
            </defs>
        </svg>
    );
};

export const BackgroundGrid = () => {
    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-transparent bg-grid-white/[0.02]">
            {/* Radial gradient for the container to give a faded look */}
            <div className="absolute inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        </div>
    );
}

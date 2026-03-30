"use client";

import React, { useRef, useEffect } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
}

interface ParticleNetworkProps {
    particleCount?: number;
    interactionMode?: 'repel' | 'connect' | 'none';
    connectionDistance?: number;
    mouseDistance?: number;
    baseSize?: number;
    color?: string; // Expects "R, G, B" string
    interactionStrength?: number; // New prop for force/speed
}

export const ParticleNetwork = ({
    particleCount = 100,
    interactionMode = 'connect',
    connectionDistance = 150,
    mouseDistance = 200,
    baseSize = 2,
    color = "6, 182, 212",
    interactionStrength = 1.0 // Default multiplier
}: ParticleNetworkProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        // Adjust count for mobile if needed, but respect prop
        const actualCount = w < 768 ? Math.floor(particleCount / 2) : particleCount;

        // Initialize particles
        for (let i = 0; i < actualCount; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * baseSize + 1
            });
        }

        const onResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            // Should properly rebuild particles on resize for accuracy, but simple clean works for now
        };

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove);

        const animate = () => {
            ctx.clearRect(0, 0, w, h);

            // Update and Draw Particles
            particles.forEach((p, i) => {
                // Movement
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                // Mouse Interaction Logic
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouseDistance) {
                    if (interactionMode === 'repel') {
                        const force = (mouseDistance - dist) / mouseDistance;
                        const angle = Math.atan2(dy, dx);
                        // Apply custom strength multiplier
                        const power = 0.05 * interactionStrength;
                        p.vx += Math.cos(angle) * force * power;
                        p.vy += Math.sin(angle) * force * power;
                    }
                    // 'connect' mode only draws lines, doesn't affect velocity (unless desired)
                }

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, 0.5)`;
                ctx.fill();

                // Inter-Particle Connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    if (dist2 < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        const opacity = 1 - (dist2 / connectionDistance);
                        ctx.strokeStyle = `rgba(${color}, ${opacity * 0.2})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                // Connect to Mouse (if mode is connect)
                if (interactionMode === 'connect' && dist < mouseDistance) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                    const opacity = 1 - (dist / mouseDistance);
                    ctx.strokeStyle = `rgba(${color}, ${opacity * 0.4})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [particleCount, interactionMode, connectionDistance, baseSize, color, mouseDistance]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
        />
    );
};

// frontend/src/components/landing/AnimatedHeroBackground.tsx
'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';

interface OrbItemProps {
    orb: {
        id: number;
        size: number;
        color: string; // Using string for HSL colors directly
        intensity: number;
        blur: string;
        initialOffsetX: string;
        initialOffsetY: string;
        continuousAnimDuration: number;
        continuousAnimScaleTo: number;
        continuousAnimXRange: string[];
        continuousAnimYRange: string[];
    };
    springMouseX: MotionValue<number>;
    springMouseY: MotionValue<number>;
}

const OrbItem: React.FC<OrbItemProps> = ({ orb, springMouseX, springMouseY }) => {
    const dx = useTransform(springMouseX, val => val * orb.intensity);
    const dy = useTransform(springMouseY, val => val * orb.intensity);

    return (
        <motion.div
            className="absolute rounded-full"
            style={{
                width: orb.size,
                height: orb.size,
                left: `calc(50% + ${orb.initialOffsetX})`,
                top: `calc(50% + ${orb.initialOffsetY})`,
                transform: 'translate(-50%, -50%)', // Combined translateX and translateY
                // x and y for parallax will be applied by framer-motion
                backgroundColor: orb.color,
                filter: `blur(${orb.blur})`,
                opacity: 0.6,
                x: dx, // MotionValues should be in style, not animate
                y: dy,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
                scale: [0.9, orb.continuousAnimScaleTo, 0.9],
                opacity: [0, 0.6, 0.6, 0.6, 0],
                // MotionValues moved to style prop
                // For continuous animation, ensure they are relative to the current parallax position
                // This requires a different approach if combining with dynamic x/y from cursor
                // Simpler: let continuous animation be on top of the base position, and parallax add to it.
                // The animate prop here will likely override style's x/y if not careful.
                // Let's use style for parallax and animate for the pulsing effect on other properties.
            }}
            // The x/y in style will handle parallax. Animate below handles continuous motion *around* that.
            // This might be tricky. A simpler way is to have continuous animation on translateX/Y properties NOT driven by cursor.
            // For now, let's keep the original continuous animation logic, assuming it's relative.
            // It might be better to separate continuous motion from cursor-driven parallax or combine them carefully.
            // The provided code in page.tsx had animate.x and animate.y using dx.get() which is problematic for continuous updates.
            // Let's keep parallax in `style` and pulsing in `animate`
            transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: orb.continuousAnimDuration + Math.random() * 3,
                ease: "easeInOut",
                delay: Math.random() * 2,
            }}
        />
    );
};


const AnimatedHeroBackground: React.FC<{ heroSectionRef: React.RefObject<HTMLDivElement> }> = ({ heroSectionRef }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 80, damping: 25, mass: 1 };
    const springMouseX = useSpring(mouseX, springConfig);
    const springMouseY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (heroSectionRef.current) {
                const rect = heroSectionRef.current.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                mouseX.set(x);
                mouseY.set(y);
            }
        };

        const currentHeroRef = heroSectionRef.current;
        if (currentHeroRef) {
            // Make sure the parent element (the section using this background) is capturing mouse move
            // This component itself won't capture mouse moves over its children (the orbs)
            // The event listener should be on the section passed by heroSectionRef
             currentHeroRef.addEventListener('mousemove', handleMouseMove);
        }
        return () => {
            if (currentHeroRef) {
                 currentHeroRef.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [mouseX, mouseY, heroSectionRef]);

    const orbs = [
        { id: 1, size: 300, color: "oklch(0.65 0.15 250)", intensity: 0.04, blur: "90px", initialOffsetX: "-25%", initialOffsetY: "-15%", continuousAnimDuration: 12, continuousAnimScaleTo: 1.2, continuousAnimXRange: ["-8%", "8%"], continuousAnimYRange: ["-6%", "6%"] },
        { id: 2, size: 480, color: "oklch(0.7 0.18 240)", intensity: 0.06, blur: "120px", initialOffsetX: "30%", initialOffsetY: "20%", continuousAnimDuration: 15, continuousAnimScaleTo: 1.15, continuousAnimXRange: ["-5%", "5%"], continuousAnimYRange: ["-10%", "10%"] },
        { id: 3, size: 220, color: "oklch(0.75 0.2 50)", intensity: 0.03, blur: "80px", initialOffsetX: "5%", initialOffsetY: "35%", continuousAnimDuration: 10, continuousAnimScaleTo: 1.3, continuousAnimXRange: ["6%", "-6%"], continuousAnimYRange: ["8%", "-8%"] },
        { id: 4, size: 380, color: "oklch(0.72 0.16 260)", intensity: 0.02, blur: "100px", initialOffsetX: "20%", initialOffsetY: "-30%", continuousAnimDuration: 14, continuousAnimScaleTo: 1.2, continuousAnimXRange: ["-7%", "7%"], continuousAnimYRange: ["-7%", "7%"] },
    ];


    return (
        // This div itself doesn't need the ref if the parent section has it for mousemove
        <div className="absolute inset-0 overflow-hidden z-0">
            {/* Static subtle grid */}
            <div className="absolute inset-0 opacity-[0.02]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="subtleGridLanding" patternUnits="userSpaceOnUse" width="60" height="60">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="oklch(0.5 0.05 250 / 0.3)" strokeWidth="0.2"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#subtleGridLanding)" />
                </svg>
            </div>

            {orbs.map(orb => (
                <OrbItem
                    key={orb.id}
                    orb={orb}
                    springMouseX={springMouseX}
                    springMouseY={springMouseY}
                />
            ))}
        </div>
    );
};

export default AnimatedHeroBackground;
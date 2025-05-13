// frontend/src/components/landing/HeroSection.tsx
'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
// import { ConnectButton as XellarConnectButton } from '@xellar/kit'; // Import Xellar's ConnectButton
import AnimatedHeroBackground from './AnimatedHeroBackground';
import { sectionVariants, itemVariants } from './motionVariants'; // Import shared variants

const HeroSection: React.FC = () => {
  const heroSectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={heroSectionRef}
      className="relative py-20 md:py-32 lg:py-36 overflow-hidden bg-brand-background" // Use brand background
    >
      <AnimatedHeroBackground heroSectionRef={heroSectionRef as React.RefObject<HTMLDivElement>} />
      <motion.div
        className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl md:text-6xl leading-tight"
        >
          <span className="block">Empowering Research with</span>
          <span
            className="block pb-1 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-transparent bg-clip-text mt-1 sm:mt-2 [text-shadow:0_0_8px_var(--tw-shadow-color)/0.5] hover:[text-shadow:0_0_16px_var(--tw-shadow-color)/0.8] transition-all duration-300 ease-in-out"
            style={{ '--tw-shadow-color': 'oklch(0.74 0.188 208.05)' } as React.CSSProperties} // Corresponds to theme(colors.sky.300)
          >
            Transparent & Efficient Funding
          </span>
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="mt-6 max-w-xl mx-auto text-lg text-text-secondary md:mt-8 md:text-xl md:max-w-3xl"
        >
          Re.grant utilizes Lisk L2 blockchain to streamline research grant management and foster collaboration within the Department of Electrical and Information Engineering.
        </motion.p>
        <motion.div variants={itemVariants} className="mt-10 flex justify-center">
            {/* <XellarConnectButton
                // label="Connect Wallet & Get Started" // Check Xellar docs for label prop
                // showBalance={false} // Check Xellar docs for similar props
                // chainStatus="none" // Check Xellar docs for similar props
            /> */}

        </motion.div>
        <motion.p variants={itemVariants} className="mt-4 text-xs text-text-muted">
          Connect your EVM-compatible wallet using Xellar to access the platform.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
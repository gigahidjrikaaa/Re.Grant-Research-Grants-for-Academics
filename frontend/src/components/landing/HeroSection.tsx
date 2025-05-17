// frontend/src/components/landing/HeroSection.tsx
'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
// import { ConnectButton as XellarConnectButton } from '@xellar/kit'; // Import Xellar's ConnectButton
import AnimatedHeroBackground from './AnimatedHeroBackground';
// Removed import for sectionVariants, itemVariants as we'll define them locally for more specific control here
// or you can update your motionVariants.ts file with these.

// --- Animation Variants ---

// Variants for the main content container (staggers its direct children)
const heroContentContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Time between each child animation (h1, p, button div, last p)
      delayChildren: 0.1,   // Initial delay before the first child starts
    },
  },
};

// Variants for individual block elements like H1, P, DIV
const blockItemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.42, 0, 0.58, 1], // Smooth ease-out
    },
  },
};

// Variants for the container of the gradient words (to stagger the words)
const gradientWordContainerVariants = {
  hidden: {}, // Parent (h1) handles initial visibility
  visible: {
    transition: {
      staggerChildren: 0.06, // Time between each word animation
      delayChildren: 0.1,    // Delay after the first line of h1 is visible
    },
  },
};

// Variants for each individual word in the gradient text
const gradientWordVariants = {
  hidden: { opacity: 0, y: 15, rotateX: -25, transformOrigin: "bottom" },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.45,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

const HeroSection: React.FC = () => {
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const gradientText = "Transparent & Efficient Funding";

  return (
    <section
      ref={heroSectionRef}
      className="relative py-20 md:py-32 lg:py-36 overflow-hidden bg-brand-background h-screen flex flex-col justify-center" // Added flex for vertical centering
    >
      <AnimatedHeroBackground heroSectionRef={heroSectionRef as React.RefObject<HTMLDivElement>} />
      <motion.div
        className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
        initial="hidden"
        animate="visible"
        variants={heroContentContainerVariants} // Use the new container variants
      >
        <motion.h1
          variants={blockItemVariants} // H1 block animates as one item first
          className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl md:text-6xl leading-tight"
        >
          <span className="block">Empowering Research with</span>
          {/* Container for the gradient words */}
          <motion.span
            className="block mt-1 sm:mt-2"
            variants={gradientWordContainerVariants} // This will stagger its children (the words)
          >
            {gradientText.split(" ").map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                variants={gradientWordVariants}
                className="inline-block pb-1 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-transparent bg-clip-text [text-shadow:0_0_8px_oklch(0.74_0.188_208.05)/0.5] hover:[text-shadow:0_0_16px_oklch(0.74_0.188_208.05)/0.8] transition-all duration-300 ease-in-out"
                style={{ marginRight: word === "&" ? '0.25em' : '0.4em' }} // Adjust spacing for ampersand or other words
              >
                {word}
              </motion.span>
            ))}
          </motion.span>
        </motion.h1>
        <motion.p
          variants={blockItemVariants} // Use blockItemVariants for consistent animation
          className="mt-6 max-w-xl mx-auto text-lg text-text-secondary md:mt-8 md:text-xl md:max-w-3xl"
        >
          Re.grant utilizes Lisk L2 blockchain to streamline research grant management and foster collaboration within the Department of Electrical and Information Engineering.
        </motion.p>
        <motion.div
          variants={blockItemVariants} // Use blockItemVariants
          className="mt-10 flex justify-center"
        >
            {/* <XellarConnectButton
                // label="Connect Wallet & Get Started"
                // showBalance={false}
                // chainStatus="none"
            /> */}
            {/* Placeholder if XellarConnectButton is not used */}
            <button className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors">
              Get Started
            </button>
        </motion.div>
        <motion.p
          variants={blockItemVariants} // Use blockItemVariants
          className="mt-4 text-xs text-text-muted"
        >
          Connect your EVM-compatible wallet to access the platform.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
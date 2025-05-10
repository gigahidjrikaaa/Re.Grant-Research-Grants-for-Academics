// frontend/src/components/landing/LandingCtaSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { sectionVariants, itemVariants } from './motionVariants';

const LandingCtaSection: React.FC = () => {
  return (
    <motion.section
        className="py-16 sm:py-24 bg-primary-blue text-primary-foreground" // text-white -> text-primary-foreground
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
    >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 variants={itemVariants} className="text-3xl font-semibold mb-6">Ready to Transform Research in Our Department?</motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-blue-100 max-w-2xl mx-auto mb-8"> {/* text-blue-100 can be themed */}
                Join Re.grant today to experience a more transparent, efficient, and collaborative approach to academic research funding and project development.
            </motion.p>
            <motion.div variants={itemVariants}>
                <ConnectButton
                    label="Connect Wallet & Join Re.grant"
                    showBalance={false}
                    chainStatus="none"
                />
            </motion.div>
            <motion.p variants={itemVariants} className="mt-4 text-xs text-blue-200"> {/* text-blue-200 can be themed */}
                Connecting your wallet is your first step to accessing all platform features.
            </motion.p>
        </div>
    </motion.section>
  );
};

export default LandingCtaSection;
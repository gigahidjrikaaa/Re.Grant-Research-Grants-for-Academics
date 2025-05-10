// frontend/src/components/landing/InfoSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { sectionVariants, itemVariants } from './motionVariants';

interface InfoSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  isAlternatingBg?: boolean; // To handle alternating backgrounds
  id?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, subtitle, children, isAlternatingBg = false, id }) => {
  const bgColor = isAlternatingBg ? 'bg-brand-background' : 'bg-content-background';
  return (
    <motion.section
      id={id}
      className={`py-16 sm:py-24 ${bgColor}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-semibold text-text-primary">{title}</h2>
          <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
        {children}
      </div>
    </motion.section>
  );
};

export default InfoSection;
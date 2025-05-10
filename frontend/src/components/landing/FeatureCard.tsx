// frontend/src/components/landing/FeatureCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cardVariants } from './motionVariants'; // Import shared variants

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <motion.div
    className="flex flex-col items-center text-center p-6 md:p-8 bg-content-background rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full"
    variants={cardVariants}
  >
    <motion.div
      className="p-4 bg-blue-100 rounded-full mb-5" // bg-blue-100 can be themed later if needed
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
    >
      <Icon className="h-8 w-8 text-primary-blue" /> {/* text-primary-blue will use Tailwind config */}
    </motion.div>
    <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default FeatureCard;
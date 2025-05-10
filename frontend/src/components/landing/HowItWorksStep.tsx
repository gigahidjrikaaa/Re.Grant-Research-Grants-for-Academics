// frontend/src/components/landing/HowItWorksStep.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { itemVariants } from './motionVariants'; // Import shared variants

interface HowItWorksStepProps {
  icon: React.ElementType;
  title: string;
  description: string;
  stepNumber: number;
}

const HowItWorksStep: React.FC<HowItWorksStepProps> = ({ icon: Icon, title, description, stepNumber }) => (
  <motion.div
    className="flex flex-col items-center text-center p-4"
    variants={itemVariants}
  >
    <div className="relative mb-4">
        <motion.div
            className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-blue text-primary-foreground shadow-md" // bg-primary-blue, text-primary-foreground
            initial={{ rotate: -45, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: stepNumber * 0.1 }}
        >
            <Icon className="h-7 w-7" />
        </motion.div>
        <motion.div
            className="absolute -top-2 -right-2 flex items-center justify-center h-7 w-7 rounded-full bg-accent-yellow text-white text-xs font-bold border-2 border-content-background" // bg-accent-yellow
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: stepNumber * 0.1 + 0.2 }}
        >
            {stepNumber}
        </motion.div>
    </div>
    <h4 className="text-lg font-medium text-text-primary mb-1">{title}</h4>
    <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default HowItWorksStep;
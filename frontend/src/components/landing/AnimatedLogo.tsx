// frontend/src/components/landing/AnimatedLogo.tsx
'use client';

import { motion } from 'framer-motion';

const AnimatedLogo = () => (
  <svg height="32" width="32" viewBox="0 0 100 100">
    <motion.circle
      cx="50"
      cy="50"
      r="45"
      stroke="var(--primary-blue-hsl)" // Using CSS variable for color consistency
      strokeWidth="7"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    />
    <motion.text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="50"
      fill="var(--primary-blue-hsl)" // Using CSS variable
      fontWeight="bold"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
    >
      R
    </motion.text>
  </svg>
);

export default AnimatedLogo;
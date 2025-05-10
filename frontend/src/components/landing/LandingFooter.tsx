// frontend/src/components/landing/LandingFooter.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LandingFooter: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-gray-100 py-10 border-t border-border-primary" // bg-gray-100 to be themed if needed, border-border-primary
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-4">
          <span className="text-sm text-text-secondary">Powered by </span>
          <a href="https://lisk.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-blue hover:underline font-medium">
            Lisk L2
          </a>
        </div>
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Re.grant - Department of Electrical and Information Engineering.
        </p>
      </div>
    </motion.footer>
  );
};

export default LandingFooter;
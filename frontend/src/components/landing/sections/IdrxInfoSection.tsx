// frontend/src/components/landing/sections/IdrxInfoSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import InfoSection from '../InfoSection';
import { itemVariants } from '../motionVariants';

const IdrxInfoSection: React.FC = () => {
  return (
    <InfoSection
      id="idrx-info"
      title="Understanding IDRX: Stable & Local Funding"
      subtitle="Re.grant utilizes IDRX for all grant funding to ensure stability and local relevance."
      isAlternatingBg={true}
    >
      <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div variants={itemVariants} className="flex justify-center">
              <div className="w-full max-w-xs h-56 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl shadow-lg flex flex-col items-center justify-center p-6">
                  <span className="text-4xl font-bold text-emerald-700">IDRX</span>
                  <span className="text-sm text-emerald-600 mt-1">Indonesian Rupiah Stablecoin</span>
              </div>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-4 text-text-secondary">
              <p className="text-lg">
                  IDRX is a stablecoin pegged 1:1 to the Indonesian Rupiah. This means its value is designed to remain stable relative to IDR, eliminating the price volatility often associated with other cryptocurrencies.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><span className="font-medium text-text-primary">Predictable Value:</span> Researchers receive and manage funds with a stable, familiar value.</li>
                  <li><span className="font-medium text-text-primary">Local Currency:</span> Simplifies budgeting and accounting for Indonesian users.</li>
                  <li><span className="font-medium text-text-primary">Blockchain Enabled:</span> Allows for fast, transparent, and low-cost transactions on the Lisk L2 network.</li>
              </ul>
              <p className="text-sm text-text-muted">
                  Acquiring and using IDRX on Lisk L2 is straightforward, facilitating seamless participation in the Re.grant ecosystem.
              </p>
          </motion.div>
      </div>
    </InfoSection>
  );
};

export default IdrxInfoSection;
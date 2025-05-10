// frontend/src/components/landing/sections/WhatIsRegrantSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import InfoSection from '../InfoSection';
import { itemVariants } from '../motionVariants';
import { Lightbulb } from 'lucide-react';

const WhatIsRegrantSection: React.FC = () => {
  return (
    <InfoSection
      id="what-is"
      title="What is Re.grant?"
      subtitle="A dedicated platform designed to modernize and simplify the research lifecycle for our department."
      isAlternatingBg={true} // First section after hero
    >
      <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div variants={itemVariants} className="space-y-4">
              <p className="text-text-secondary leading-relaxed">
                  Re.grant is an innovative initiative by the Department of Electrical and Information Engineering to address common challenges in academic research funding and collaboration. By leveraging the power of Lisk L2 blockchain technology, we aim to create a more transparent, efficient, and accessible ecosystem for our researchers, students, and faculty.
              </p>
              <p className="text-text-secondary leading-relaxed">
                  Our platform facilitates the entire grant process, from application and review to milestone-based fund disbursement using IDRX, an Indonesian Rupiah-pegged stablecoin. Beyond funding, Re.grant fosters a collaborative environment through its integrated Talent Pool and Project Board, connecting expertise with opportunity.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary pl-4">
                  <li><span className="font-medium text-primary-blue">Enhanced Transparency:</span> Track grant applications and fund usage on an immutable ledger.</li>
                  <li><span className="font-medium text-primary-blue">Increased Efficiency:</span> Automate disbursements and reduce administrative burdens.</li>
                  <li><span className="font-medium text-primary-blue">Fosters Collaboration:</span> Easily find project partners or contribute to ongoing research.</li>
              </ul>
          </motion.div>
          <motion.div variants={itemVariants} className="flex justify-center">
              <div className="w-full max-w-md h-64 bg-gradient-to-tr from-blue-100 to-indigo-200 rounded-xl shadow-lg flex items-center justify-center">
                  <Lightbulb className="h-24 w-24 text-primary-blue opacity-70" />
              </div>
          </motion.div>
      </div>
    </InfoSection>
  );
};

export default WhatIsRegrantSection;
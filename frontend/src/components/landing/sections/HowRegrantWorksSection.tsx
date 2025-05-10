// frontend/src/components/landing/sections/HowRegrantWorksSection.tsx
'use client';

import React from 'react';
import InfoSection from '../InfoSection';
import HowItWorksStep from '../HowItWorksStep'; // Re-use the HowItWorksStep component
import { FileText, CheckCircle, Zap, LinkIcon } from 'lucide-react';

const HowRegrantWorksSection: React.FC = () => {
  return (
    <InfoSection
      id="how-it-works"
      title="How Re.grant Works"
      subtitle="A simple, streamlined process powered by blockchain technology."
      isAlternatingBg={false}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <HowItWorksStep stepNumber={1} icon={FileText} title="Submit Proposal" description="Researchers submit grant proposals with detailed project plans, budgets in IDRX, and defined milestones directly on the platform." />
          <HowItWorksStep stepNumber={2} icon={CheckCircle} title="Review & Approval" description="The departmental committee reviews proposals. Approved grants are recorded on the Lisk L2 blockchain for transparency." />
          <HowItWorksStep stepNumber={3} icon={Zap} title="Automated Funding" description="Upon verified milestone completion, IDRX funds are automatically disbursed to the researcher's connected wallet via smart contracts." />
          <HowItWorksStep stepNumber={4} icon={LinkIcon} title="Collaborate & Connect" description="Utilize the Talent Pool and Project Board to find collaborators or offer your expertise for various research initiatives." />
      </div>
    </InfoSection>
  );
};

export default HowRegrantWorksSection;
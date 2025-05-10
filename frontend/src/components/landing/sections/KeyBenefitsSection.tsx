// frontend/src/components/landing/sections/KeyBenefitsSection.tsx
'use client';

import React from 'react';
import InfoSection from '../InfoSection';
import FeatureCard from '../FeatureCard'; // Re-use the FeatureCard component
import { FileText, Users, Briefcase, Zap, ShieldCheck, BarChart3 } from 'lucide-react';

const KeyBenefitsSection: React.FC = () => {
  return (
    <InfoSection
      id="key-benefits"
      title="Key Benefits of Re.grant"
      subtitle="Discover how Re.grant enhances the research lifecycle for everyone involved."
      isAlternatingBg={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard icon={FileText} title="Transparent Grants" description="Apply for and manage research grants with automated, auditable funding disbursements on the Lisk L2 blockchain using IDRX." />
          <FeatureCard icon={Users} title="Dynamic Talent Pool" description="Discover and connect with skilled students and lecturers. Showcase your expertise and find collaborators for your projects." />
          <FeatureCard icon={Briefcase} title="Active Project Board" description="Post specific project needs or find opportunities to contribute your skills to ongoing departmental research initiatives."/>
          <FeatureCard icon={Zap} title="Efficient Workflows" description="Streamlined processes for applications, reviews, and milestone tracking, significantly reducing administrative overhead." />
          <FeatureCard icon={ShieldCheck} title="Secure & Auditable Records" description="Leverage blockchain for enhanced security, data integrity, and a transparent, immutable record of all grant activities." />
          <FeatureCard icon={BarChart3} title="Fostering Innovation" description="Built on modern Web3 technology, Re.grant prepares the department for the future of decentralized research and collaboration." />
      </div>
    </InfoSection>
  );
};

export default KeyBenefitsSection;
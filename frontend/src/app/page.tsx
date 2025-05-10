// src/app/page.tsx
'use client';

import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Users, FileText, Briefcase, Zap, ShieldCheck, Lightbulb, BarChart3, LinkIcon, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useSpring, MotionValue } from 'framer-motion';

// Placeholder Logo component or SVG
const Logo = () => (
    <svg height="32" width="32" viewBox="0 0 100 100">
        <motion.circle
            cx="50" cy="50" r="45"
            stroke="#1E3A8A" strokeWidth="7" fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
        />
        <motion.text
            x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
            fontSize="50" fill="#1E3A8A" fontWeight="bold"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        >
            R
        </motion.text>
    </svg>
);

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}
const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <motion.div
    className="flex flex-col items-center text-center p-6 md:p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full"
    variants={cardVariants}
  >
    <motion.div
      className="p-4 bg-blue-100 rounded-full mb-5"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
    >
      <Icon className="h-8 w-8 text-primary-blue" />
    </motion.div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

// How it Works Step Component
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
            className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-blue text-white shadow-md"
            initial={{ rotate: -45, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: stepNumber * 0.1 }}
        >
            <Icon className="h-7 w-7" />
        </motion.div>
        <motion.div
            className="absolute -top-2 -right-2 flex items-center justify-center h-7 w-7 rounded-full bg-amber-500 text-white text-xs font-bold border-2 border-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: stepNumber * 0.1 + 0.2 }}
        >
            {stepNumber}
        </motion.div>
    </div>
    <h4 className="text-lg font-medium text-gray-800 mb-1">{title}</h4>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

// OrbItem component with continuous animation + cursor parallax
interface OrbItemProps {
    orb: {
        id: number;
        size: number;
        color: string;
        intensity: number; // For cursor parallax strength
        blur: string;
        initialOffsetX: string;
        initialOffsetY: string;
        // New properties for continuous animation
        continuousAnimDuration: number;
        continuousAnimScaleTo: number;
        continuousAnimXRange: string[]; // e.g., ["-5%", "5%"]
        continuousAnimYRange: string[]; // e.g., ["-5%", "5%"]
    };
    springMouseX: MotionValue<number>;
    springMouseY: MotionValue<number>;
}

const OrbItem: React.FC<OrbItemProps> = ({ orb, springMouseX, springMouseY }) => {
    // Cursor Parallax Transforms
    const dx = useTransform(springMouseX, val => val * orb.intensity);
    const dy = useTransform(springMouseY, val => val * orb.intensity);

    return (
        <motion.div
            className="absolute rounded-full"
            style={{
                width: orb.size,
                height: orb.size,
                left: `calc(50% + ${orb.initialOffsetX})`,
                top: `calc(50% + ${orb.initialOffsetY})`,
                translateX: "-50%",
                translateY: "-50%",
                x: dx, // Apply cursor parallax
                y: dy, // Apply cursor parallax
                backgroundColor: orb.color,
                filter: `blur(${orb.blur})`,
                opacity: 0.6, // Base opacity for softer look
            }}
            initial={{ scale: 0.8, opacity: 0 }} // Initial entrance animation
            animate={{ // Continuous animation + entrance
                scale: [0.9, orb.continuousAnimScaleTo, 0.9], // Entrance + continuous pulse
                opacity: [0, 0.6, 0.6, 0.6, 0], // Fade in, stay, fade out slightly for pulse
                x: [dx.get(), ...orb.continuousAnimXRange.map(val => `calc(${dx.get()}px + ${val})`), dx.get()], // Combine with cursor parallax
                y: [dy.get(), ...orb.continuousAnimYRange.map(val => `calc(${dy.get()}px + ${val})`), dy.get()], // Combine with cursor parallax
            }}
            transition={{
                // Entrance part
                // duration: 1.5, // Handled by continuous loop's first iteration
                // delay: Math.random() * 0.5,
                // ease: "circOut",

                // Continuous animation part
                repeat: Infinity,
                repeatType: "mirror",
                duration: orb.continuousAnimDuration + Math.random() * 3, // Vary duration for natural feel
                ease: "easeInOut",
                delay: Math.random() * 2, // Stagger start of continuous animation
            }}
        />
    );
};


// Updated Animated Geometric Background for Hero with Cursor Interaction
const AnimatedHeroBackground = () => {
    const heroRef = useRef<HTMLDivElement>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 80, damping: 25, mass: 1 }; // Slightly softer spring
    const springMouseX = useSpring(mouseX, springConfig);
    const springMouseY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                mouseX.set(x);
                mouseY.set(y);
            }
        };
        // Attach to the hero section itself, not the background div for correct coords
        // This means the parent <section> where AnimatedHeroBackground is used should have the ref.
        // For simplicity here, we assume heroRef is on this component's root div.
        const currentHeroRef = heroRef.current;
        if (currentHeroRef) {
            currentHeroRef.addEventListener('mousemove', handleMouseMove);
        }
        return () => {
            if (currentHeroRef) {
                currentHeroRef.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [mouseX, mouseY]);

    // Orb configurations with continuous animation parameters
    const orbs = [
        { id: 1, size: 300, color: "hsl(220, 90%, 65%)", intensity: 0.04, blur: "90px", initialOffsetX: "-25%", initialOffsetY: "-15%", continuousAnimDuration: 12, continuousAnimScaleTo: 1.2, continuousAnimXRange: ["-8%", "8%"], continuousAnimYRange: ["-6%", "6%"] },
        { id: 2, size: 480, color: "hsl(210, 95%, 70%)", intensity: 0.06, blur: "120px", initialOffsetX: "30%", initialOffsetY: "20%", continuousAnimDuration: 15, continuousAnimScaleTo: 1.15, continuousAnimXRange: ["-5%", "5%"], continuousAnimYRange: ["-10%", "10%"] },
        { id: 3, size: 220, color: "hsl(35, 100%, 60%)", intensity: 0.03, blur: "80px", initialOffsetX: "5%", initialOffsetY: "35%", continuousAnimDuration: 10, continuousAnimScaleTo: 1.3, continuousAnimXRange: ["6%", "-6%"], continuousAnimYRange: ["8%", "-8%"] },
        { id: 4, size: 380, color: "hsl(230, 85%, 75%)", intensity: 0.02, blur: "100px", initialOffsetX: "20%", initialOffsetY: "-30%", continuousAnimDuration: 14, continuousAnimScaleTo: 1.2, continuousAnimXRange: ["-7%", "7%"], continuousAnimYRange: ["-7%", "7%"] },
    ];

    return (
        // The heroRef should ideally be on the parent <section> in LandingPage for mousemove relative to the whole section.
        // If it's on this div, mousemove is relative to this div's bounds.
        <div ref={heroRef} className="absolute inset-0 overflow-hidden z-0">
            {/* Static subtle grid for base texture if desired */}
            <div className="absolute inset-0 opacity-[0.02]"> {/* Further reduced opacity for grid */}
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="subtleGrid" patternUnits="userSpaceOnUse" width="60" height="60">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="hsla(222, 47%, 50%, 0.3)" strokeWidth="0.2"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#subtleGrid)" />
                </svg>
            </div>

            {orbs.map(orb => (
                <OrbItem
                    key={orb.id}
                    orb={orb}
                    springMouseX={springMouseX}
                    springMouseY={springMouseY}
                />
            ))}
        </div>
    );
};


export default function LandingPage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const heroSectionRef = useRef<HTMLDivElement>(null); // Ref for the hero <section>

  useEffect(() => {
    if (isConnected && address) {
      router.push('/grants');
    }
  }, [isConnected, address, router]);

  if (isConnected) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
              <p className="text-gray-700">Redirecting to Re.grant platform...</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white/80 backdrop-blur-lg"
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="font-bold text-xl text-primary-blue">Re.grant</span>
          </Link>
          <div>
            <ConnectButton
              label="Connect & Enter Platform"
              showBalance={false}
              chainStatus="none"
            />
          </div>
        </div>
      </motion.header>

      <main className="flex-grow">
        {/* Hero Section */}
        {/* Pass the ref to the section for mouse move detection */}
        <section ref={heroSectionRef} className="relative py-20 md:py-32 lg:py-36 overflow-hidden bg-white">
          {/* Pass the heroSectionRef to the AnimatedHeroBackground if it needs to calculate bounds relative to this section */}
          {/* For simplicity, AnimatedHeroBackground's internal ref will work if it fills the section */}
          <AnimatedHeroBackground />
          <motion.div
            className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl leading-tight"
            >
              <span className="block">Empowering Research with</span>
              <span
                className="block pb-1 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-transparent bg-clip-text mt-1 sm:mt-2 [text-shadow:0_0_8px_theme(colors.sky.300/50%)] hover:[text-shadow:0_0_16px_theme(colors.sky.300/80%)] transition-all duration-300 ease-in-out"
              >
                Transparent & Efficient Funding
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-xl mx-auto text-lg text-gray-700 md:mt-8 md:text-xl md:max-w-3xl"
            >
              Re.grant utilizes Lisk L2 blockchain to streamline research grant management and foster collaboration within the Department of Electrical and Information Engineering.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-10 flex justify-center">
              <ConnectButton
                label="Connect Wallet & Get Started"
                showBalance={false}
                chainStatus="none"
              />
            </motion.div>
             <motion.p variants={itemVariants} className="mt-4 text-xs text-gray-500">
                Connect your EVM-compatible wallet to access the platform.
             </motion.p>
          </motion.div>
        </section>

        {/* Sections with scroll-triggered animations */}
        {[[
          "What is Re.grant?",
          "A dedicated platform designed to modernize and simplify the research lifecycle for our department.",
          <div key="what-is-content" className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div variants={itemVariants} className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                      Re.grant is an innovative initiative by the Department of Electrical and Information Engineering to address common challenges in academic research funding and collaboration. By leveraging the power of Lisk L2 blockchain technology, we aim to create a more transparent, efficient, and accessible ecosystem for our researchers, students, and faculty.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                      Our platform facilitates the entire grant process, from application and review to milestone-based fund disbursement using IDRX, an Indonesian Rupiah-pegged stablecoin. Beyond funding, Re.grant fosters a collaborative environment through its integrated Talent Pool and Project Board, connecting expertise with opportunity.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
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
        ], [
          "How Re.grant Works",
          "A simple, streamlined process powered by blockchain technology.",
          <div key="how-it-works-content" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <HowItWorksStep stepNumber={1} icon={FileText} title="Submit Proposal" description="Researchers submit grant proposals with detailed project plans, budgets in IDRX, and defined milestones directly on the platform." />
              <HowItWorksStep stepNumber={2} icon={CheckCircle} title="Review & Approval" description="The departmental committee reviews proposals. Approved grants are recorded on the Lisk L2 blockchain for transparency." />
              <HowItWorksStep stepNumber={3} icon={Zap} title="Automated Funding" description="Upon verified milestone completion, IDRX funds are automatically disbursed to the researcher's connected wallet via smart contracts." />
              <HowItWorksStep stepNumber={4} icon={LinkIcon} title="Collaborate & Connect" description="Utilize the Talent Pool and Project Board to find collaborators or offer your expertise for various research initiatives." />
          </div>
        ], [
          "Understanding IDRX: Stable & Local Funding",
          "Re.grant utilizes IDRX for all grant funding to ensure stability and local relevance.",
          <div key="idrx-content" className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div variants={itemVariants} className="flex justify-center">
                  <div className="w-full max-w-xs h-56 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl shadow-lg flex flex-col items-center justify-center p-6">
                      <span className="text-4xl font-bold text-emerald-700">IDRX</span>
                      <span className="text-sm text-emerald-600 mt-1">Indonesian Rupiah Stablecoin</span>
                  </div>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-4">
                  <p className="text-lg text-gray-600">
                      IDRX is a stablecoin pegged 1:1 to the Indonesian Rupiah. This means its value is designed to remain stable relative to IDR, eliminating the price volatility often associated with other cryptocurrencies.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                      <li><span className="font-medium">Predictable Value:</span> Researchers receive and manage funds with a stable, familiar value.</li>
                      <li><span className="font-medium">Local Currency:</span> Simplifies budgeting and accounting for Indonesian users.</li>
                      <li><span className="font-medium">Blockchain Enabled:</span> Allows for fast, transparent, and low-cost transactions on the Lisk L2 network.</li>
                  </ul>
                  <p className="text-sm text-gray-500">
                      Acquiring and using IDRX on Lisk L2 is straightforward, facilitating seamless participation in the Re.grant ecosystem.
                  </p>
              </motion.div>
          </div>
        ], [
            "Key Benefits of Re.grant",
            "Discover how Re.grant enhances the research lifecycle for everyone involved.",
            <div key="benefits-content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard icon={FileText} title="Transparent Grants" description="Apply for and manage research grants with automated, auditable funding disbursements on the Lisk L2 blockchain using IDRX." />
                <FeatureCard icon={Users} title="Dynamic Talent Pool" description="Discover and connect with skilled students and lecturers. Showcase your expertise and find collaborators for your projects." />
                <FeatureCard icon={Briefcase} title="Active Project Board" description="Post specific project needs or find opportunities to contribute your skills to ongoing departmental research initiatives."/>
                <FeatureCard icon={Zap} title="Efficient Workflows" description="Streamlined processes for applications, reviews, and milestone tracking, significantly reducing administrative overhead." />
                <FeatureCard icon={ShieldCheck} title="Secure & Auditable Records" description="Leverage blockchain for enhanced security, data integrity, and a transparent, immutable record of all grant activities." />
                <FeatureCard icon={BarChart3} title="Fostering Innovation" description="Built on modern Web3 technology, Re.grant prepares the department for the future of decentralized research and collaboration." />
            </div>
        ]].map(([title, subtitle, content], index) => (
          <motion.section
            key={title as string}
            className={`py-16 sm:py-24 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} // Alternating backgrounds
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Trigger when 20% of the section is visible
            variants={sectionVariants}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl font-semibold text-gray-800">{title as string}</h2>
                <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                  {subtitle as string}
                </p>
              </motion.div>
              {content as React.ReactNode}
            </div>
          </motion.section>
        ))}

        {/* Call to Action Section */}
        <motion.section
            className="py-16 sm:py-24 bg-primary-blue text-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.h2 variants={itemVariants} className="text-3xl font-semibold mb-6">Ready to Transform Research in Our Department?</motion.h2>
                <motion.p variants={itemVariants} className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
                    Join Re.grant today to experience a more transparent, efficient, and collaborative approach to academic research funding and project development.
                </motion.p>
                <motion.div variants={itemVariants}>
                    <ConnectButton
                        label="Connect Wallet & Join Re.grant"
                        showBalance={false}
                        chainStatus="none"
                    />
                </motion.div>
                <motion.p variants={itemVariants} className="mt-4 text-xs text-blue-200">
                    Connecting your wallet is your first step to accessing all platform features.
                </motion.p>
            </div>
        </motion.section>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gray-100 py-10 border-t border-gray-200"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <span className="text-sm text-gray-600">Powered by </span>
            <a href="https://lisk.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-blue hover:underline font-medium">
              Lisk L2
            </a>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Re.grant - Department of Electrical and Information Engineering.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

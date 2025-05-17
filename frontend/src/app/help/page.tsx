'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone, MessageSquare } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const generalFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What is Re.Grant?',
    answer: 'Re.Grant is a decentralized platform connecting researchers with grant funding opportunities using Web3 technologies for transparency and efficiency.',
  },
  {
    id: 'faq-2',
    question: 'How do I create an account?',
    answer: 'You can connect your Web3 wallet (like MetaMask) to sign in. Your wallet address serves as your primary identifier. You can then complete your profile.',
  },
  {
    id: 'faq-3',
    question: 'Is there a fee to use Re.Grant?',
    answer: 'Basic access to browse grants and create a profile is free. Specific actions, like applying for certain premium grants or advanced features, might involve nominal gas fees on the blockchain or platform fees, which will be clearly indicated.',
  },
];

const applicationFaqs: FaqItem[] = [
  {
    id: 'app-faq-1',
    question: 'How do I apply for a grant?',
    answer: 'Navigate to the "Grants" section, find a suitable grant, and click "Apply." You will be guided through the submission process, which may involve uploading documents and providing details about your research proposal.',
  },
  {
    id: 'app-faq-2',
    question: 'What file formats are accepted for proposals?',
    answer: 'Typically, PDF format is preferred for research proposals and supporting documents. Specific requirements may vary per grant, so please check the grant details.',
  },
  {
    id: 'app-faq-3',
    question: 'How can I track the status of my application?',
    answer: 'You can track the status of your applications from your user dashboard under the "My Applications" section. You will also receive notifications for major updates.',
  },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Help & Support Center
        </h1>
        <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
          Find answers to common questions and learn how to get the most out of Re.Grant.
        </p>
      </header>

      <main className="grid gap-12 md:grid-cols-3">
        <section className="md:col-span-2">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
          
          <h3 className="text-xl font-medium text-foreground mt-6 mb-3">General</h3>
          <Accordion type="single" collapsible className="w-full">
            {generalFaqs.map((faq) => (
              <AccordionItem value={faq.id} key={faq.id}>
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <h3 className="text-xl font-medium text-foreground mt-8 mb-3">Grant Applications</h3>
          <Accordion type="single" collapsible className="w-full">
            {applicationFaqs.map((faq) => (
              <AccordionItem value={faq.id} key={faq.id}>
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <aside className="md:col-span-1">
          <Card className="sticky top-24 shadow-lg"> {/* sticky for better UX on scroll */}
            <CardHeader>
              <CardTitle className="text-2xl">Contact Support</CardTitle>
              <CardDescription>
                Can&apos;t find what you&apos;re looking for? Reach out to us.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:support@regrant.example.com" className="text-sm text-foreground hover:text-primary">
                  support@regrant.example.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">(+1) 555-0123 (Mon-Fri, 9am-5pm EST)</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <a href="/community-forum" className="text-sm text-foreground hover:text-primary">
                  Community Forum
                </a>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
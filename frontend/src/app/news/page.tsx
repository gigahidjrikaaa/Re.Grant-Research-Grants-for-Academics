'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  slug: string; // For "Read More" link
}

const mockNewsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Re.Grant Platform Launch: Revolutionizing Research Funding',
    date: 'May 15, 2025',
    category: 'Platform Update',
    excerpt: 'We are thrilled to announce the official launch of Re.Grant, a new platform designed to connect researchers with funding opportunities more efficiently than ever before.',
    slug: 'regrant-platform-launch',
  },
  {
    id: '2',
    title: 'Understanding the New Grant Application Process',
    date: 'May 10, 2025',
    category: 'Guides',
    excerpt: 'Our revamped grant application process is designed for clarity and ease of use. Learn about the key changes and how to submit your proposal successfully.',
    slug: 'new-grant-application-process',
  },
  {
    id: '3',
    title: 'Spotlight: Successful Funding of AI in Healthcare Research',
    date: 'May 5, 2025',
    category: 'Success Stories',
    excerpt: 'Discover how Dr. Ada Lovelace secured funding through Re.Grant for her groundbreaking research in artificial intelligence applications for healthcare.',
    slug: 'ai-healthcare-funding-success',
  },
  {
    id: '4',
    title: 'Upcoming Webinar: Navigating Web3 for Academic Research',
    date: 'April 28, 2025',
    category: 'Events',
    excerpt: 'Join our upcoming webinar to explore how Web3 technologies are shaping the future of academic research and funding. Register now!',
    slug: 'web3-research-webinar',
  },
];

export default function NewsPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          News & Updates
        </h1>
        <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
          Stay informed with the latest articles, announcements, and success stories from Re.Grant.
        </p>
      </header>

      <main className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {mockNewsArticles.map((article) => (
          <Card key={article.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="mb-2">
                <Badge variant="outline">{article.category}</Badge>
              </div>
              <CardTitle className="text-xl font-semibold leading-tight">
                {article.title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {article.date}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-foreground/80 line-clamp-3">
                {article.excerpt}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="text-sm text-primary hover:text-primary/80">
                <Link href={`/news/${article.slug}`}>
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </main>
    </div>
  );
}
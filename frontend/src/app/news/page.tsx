'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import {
  Card,
//   CardContent,
  // CardDescription, // Not explicitly used, can be removed if not planned
//   CardFooter,
//   CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CalendarDays } from 'lucide-react';
// import { Metadata } from 'next';

// SEO Metadata for the /news page
// export const metadata: Metadata = {
//   title: 'News & Updates | Re.Grant',
//   description: 'Stay informed with the latest articles, announcements, and success stories from the Re.Grant platform.',
//   openGraph: {
//     title: 'News & Updates | Re.Grant',
//     description: 'Stay informed with the latest articles, announcements, and success stories from the Re.Grant platform.',
//     // images: ['/og-news.png'], // Replace with your actual OG image path
//   },
// };

interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  imageAlt: string;
}

const mockNewsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Re.Grant Platform Launch: Revolutionizing Research Funding',
    date: 'May 17, 2025',
    category: 'Platform Update',
    excerpt: 'We are thrilled to announce the official launch of Re.Grant, a new platform designed to connect researchers with funding opportunities more efficiently than ever before.',
    slug: 'regrant-platform-launch',
    imageUrl: 'https://picsum.photos/seed/regrantlaunch/600/400',
    imageAlt: 'Abstract representation of a platform launch with network connections.',
  },
  {
    id: '2',
    title: 'Understanding the New Grant Application Process',
    date: 'May 10, 2025',
    category: 'Guides',
    excerpt: 'Our revamped grant application process is designed for clarity and ease of use. Learn about the key changes and how to submit your proposal successfully.',
    slug: 'new-grant-application-process',
    imageUrl: 'https://picsum.photos/seed/grantprocess/600/400',
    imageAlt: 'Illustration of a streamlined application process with checklist and documents.',
  },
  {
    id: '3',
    title: 'Spotlight: Successful Funding of AI in Healthcare Research',
    date: 'May 05, 2025',
    category: 'Success Stories',
    excerpt: 'Discover how Dr. Ada Lovelace secured funding through Re.Grant for her groundbreaking research in artificial intelligence applications for healthcare.',
    slug: 'ai-healthcare-funding-success',
    imageUrl: 'https://picsum.photos/seed/aihealthcare/600/400',
    imageAlt: 'Conceptual image of AI merging with healthcare symbols.',
  },
  {
    id: '4',
    title: 'Upcoming Webinar: Navigating Web3 for Academic Research',
    date: 'April 28, 2025',
    category: 'Events',
    excerpt: 'Join our upcoming webinar to explore how Web3 technologies are shaping the future of academic research and funding. Register now!',
    slug: 'web3-research-webinar',
    imageUrl: 'https://picsum.photos/seed/web3webinar/600/400',
    imageAlt: 'Graphic representing a webinar on Web3 and academic research.',
  },
];

export default function NewsPage() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          News & Updates
        </h1>
        <p className="mt-4 text-lg text-muted-foreground sm:mt-5 max-w-2xl mx-auto">
          Stay informed with the latest articles, announcements, and success stories from Re.Grant.
        </p>
      </header>

      <main className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {mockNewsArticles.map((article) => (
          <Card 
            key={article.id} 
            className="flex flex-col overflow-hidden rounded-xl border border-border/60 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out group bg-card"
          >
            <Link href={`/news/${article.slug}`} className="block group/image" aria-label={`Read more about ${article.title}`}>
              <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-xl"> {/* Aspect ratio for consistent image height */}
                <Image
                  src={article.imageUrl}
                  alt={article.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-in-out group-hover/image:scale-105"
                />
              </div>
            </Link>
            
            <div className="p-5 flex flex-col flex-grow"> {/* Combined content area */}
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="outline" className="font-medium text-xs py-0.5 px-1.5">{article.category}</Badge>
                <div className="flex items-center">
                  <CalendarDays className="h-3.5 w-3.5 mr-1" />
                  <span>{article.date}</span>
                </div>
              </div>

              <Link href={`/news/${article.slug}`} className="block mb-3">
                <CardTitle className="text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
              </Link>
              
              <p className="text-sm text-muted-foreground line-clamp-3 flex-grow mb-4">
                {article.excerpt}
              </p>
              
              <div className="mt-auto"> {/* Pushes footer to the bottom */}
                <Button asChild variant="ghost" className="p-0 h-auto text-sm text-primary hover:text-primary/90 group-hover:underline font-medium">
                  <Link href={`/news/${article.slug}`}>
                    Read Article <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellRing, CheckCircle, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type NotificationStatus = 'unread' | 'read' | 'archived';
type NotificationType = 'grant_match' | 'application_update' | 'system_message' | 'deadline_reminder';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string or formatted date
  status: NotificationStatus;
  link?: string; // Optional link to relevant page
}

const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'grant_match',
    title: 'New Grant Opportunity Matches Your Profile!',
    message: 'The "Future of AI Research Grant" aligns with your skills in Machine Learning and NLP.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'unread',
    link: '/grants/future-of-ai',
  },
  {
    id: 'notif-2',
    type: 'application_update',
    title: 'Application Status Update',
    message: 'Your application for "Sustainable Energy Solutions Grant" has moved to the review stage.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'unread',
    link: '/dashboard/applications/app-123',
  },
  {
    id: 'notif-3',
    type: 'deadline_reminder',
    title: 'Deadline Approaching!',
    message: 'Submission deadline for "Quantum Computing Initiative" is in 3 days.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'read',
    link: '/grants/quantum-computing-initiative',
  },
  {
    id: 'notif-4',
    type: 'system_message',
    title: 'Welcome to Re.Grant!',
    message: 'We are excited to have you on board. Complete your profile to get started.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: 'read',
    link: '/profile',
  },
  {
    id: 'notif-5',
    type: 'application_update',
    title: 'Application Approved!',
    message: 'Congratulations! Your application for "Marine Biology Research Fund" has been approved.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: 'read',
    link: '/dashboard/applications/app-007',
  },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'grant_match': return <BellRing className="h-5 w-5 text-blue-500" />;
    case 'application_update': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'deadline_reminder': return <BellRing className="h-5 w-5 text-orange-500" />;
    case 'system_message': return <BellRing className="h-5 w-5 text-gray-500" />;
    default: return <BellRing className="h-5 w-5 text-gray-400" />;
  }
};

const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};


export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    // In a real app, you'd call an API here
  };

  const handleArchive = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id)); // Simple removal for now
    // In a real app, you'd call an API to archive
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.status === 'unread'
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your Notifications
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage and review all your updates from Re.Grant.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
            All
          </Button>
          <Button variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')}>
            Unread ({notifications.filter(n => n.status === 'unread').length})
          </Button>
        </div>
      </header>

      <main>
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={cn(
                  "transition-all duration-200 ease-in-out",
                  notification.status === 'unread' ? 'bg-primary/5 border-primary/20' : 'bg-card'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getNotificationIcon(notification.type)}
                      <CardTitle className="text-lg font-medium leading-tight">{notification.title}</CardTitle>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(notification.timestamp)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-foreground/80">{notification.message}</p>
                  {notification.link && (
                    <Button asChild variant="link" size="sm" className="px-0 h-auto mt-1 text-primary">
                      <Link href={notification.link}>View Details</Link>
                    </Button>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 pt-0 pb-3 px-4">
                  {notification.status === 'unread' && (
                    <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Mark as Read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleArchive(notification.id)}>
                     <Archive className="mr-2 h-4 w-4" /> Archive
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">No notifications here</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Grant } from '@/types/api'; // Adjust path
import { getGrantById } from '@/lib/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import PageLoader from '@/components/ui/PageLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Import Badge UI component
import { ArrowLeft, CalendarDays, DollarSign, LinkIcon } from 'lucide-react'; // Removed Badge from here
import { format } from 'date-fns';
import Link from 'next/link'; // Import Link

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const grantId = params.grantId as string;

  const [grant, setGrant] = useState<Grant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth(); // Assuming user might be needed for "Apply" button logic

  useEffect(() => {
    if (!grantId) return;

    const fetchGrantDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getGrantById(grantId, token);
        setGrant(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : `Failed to fetch grant (ID: ${grantId}). An unexpected error occurred.`;
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrantDetail();
  }, [grantId, token]);

  if (isLoading) return <PageLoader isLoading={isLoading} />;
  if (error) return <div className="text-center py-10 text-red-600">Error: {error} <Button onClick={() => router.back()} variant="link">Go back</Button></div>;
  if (!grant) return <div className="text-center py-10">Grant not found. <Button onClick={() => router.back()} variant="link">Go back</Button></div>;

  const funderName = grant.funder?.full_name || 'N/A';

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Button onClick={() => router.back()} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Grants
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <Badge variant="secondary" className="mb-2 text-sm">{grant.grant_type}</Badge>
              <CardTitle className="text-2xl lg:text-3xl font-bold">{grant.title}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                Offered by: {funderName}
              </CardDescription>
            </div>
            {/* Placeholder for Apply Button - logic depends on application system */}
            {user && (
              <Button asChild size="lg">
                <Link href={`/apply?type=grant&id=${grant.id}`}>Apply Now</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start p-4 border rounded-lg">
              <DollarSign className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-muted-foreground">Amount Awarded</p>
                <p className="text-lg font-bold">{grant.currency} {Number(grant.amount_awarded).toLocaleString()}</p>
              </div>
            </div>
            {grant.application_start_date && (
                 <div className="flex items-start p-4 border rounded-lg">
                    <CalendarDays className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-muted-foreground">Application Opens</p>
                        <p>{format(new Date(grant.application_start_date), "PPP")}</p>
                    </div>
                </div>
            )}
            <div className="flex items-start p-4 border rounded-lg">
              <CalendarDays className="h-5 w-5 mr-3 mt-1 text-destructive flex-shrink-0" />
              <div>
                <p className="font-semibold text-muted-foreground">Application Deadline</p>
                <p>{format(new Date(grant.application_deadline), "PPP p")}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{grant.description}</p>
          </div>

          {grant.eligibility_criteria && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Eligibility Criteria</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{grant.eligibility_criteria}</p>
            </div>
          )}
          
          {grant.website_link && (
             <div>
                <h3 className="text-xl font-semibold mb-2">Official Link</h3>
                <a href={grant.website_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                    <LinkIcon className="h-4 w-4 mr-2"/>
                    Visit Grant Website
                </a>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
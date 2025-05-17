'use client';

import { useEffect, useState } from 'react';
import { Grant } from '@/types/api'; // Adjust path if your types are elsewhere
import { getAllGrants } from '@/lib/apiService';
import { useAuth } from '@/contexts/AuthContext'; // If auth is needed for fetching
import { toast } from 'sonner';
import PageLoader from '@/components/ui/PageLoader'; // Your loader component
// import GrantCard from '@/components/grants/GrantCard'; // Your grant card component
import Link from 'next/link'; // For linking to detail pages
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Briefcase, CalendarDays, DollarSign } from 'lucide-react';
import { format } from 'date-fns'; // For date formatting

// Define a simple GrantCard component here or import it
const GrantCard: React.FC<{ grant: Grant }> = ({ grant }) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <Badge variant="outline" className="mb-2">{grant.grant_type}</Badge>
                <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
                    <Link href={`/grants/${grant.id}`}>{grant.title}</Link>
                </CardTitle>
            </div>
            {/* Optional: Funder Logo or Initials */}
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {grant.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{grant.currency} {Number(grant.amount_awarded).toLocaleString()}</span>
        </div>
        {grant.application_deadline && (
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Deadline: {format(new Date(grant.application_deadline), "PPP")}</span>
          </div>
        )}
        {grant.funder && (
            <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Funder: {grant.funder.full_name || 'N/A'}</span>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/grants/${grant.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function GrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Get token if your API requires it for listing

  const [currentPage, setCurrentPage] = useState(0); // For pagination
  const [limitPerPage] = useState(9); // Number of items per page
  const [totalGrants, setTotalGrants] = useState(0); // If backend provides total for pagination

  useEffect(() => {
    const fetchGrants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // For now, assuming getAllGrants returns the full list.
        // If it returns a PaginatedResponse, you'll need to adjust.
        // const response = await getAllGrants({ skip: currentPage * limitPerPage, limit: limitPerPage }, token);
        // For simplicity, let's assume it returns Grant[] directly and we handle pagination client-side (not ideal for large datasets)
        // OR, if your backend doesn't do pagination yet for this endpoint and returns all:
        const allFetchedGrants = await getAllGrants({ limit: 100 }, token); // Fetch up to 100 for now
        
        // If backend sends total:
        // setGrants(response.items); 
        // setTotalGrants(response.total);

        // If backend just sends array:
        setGrants(allFetchedGrants);
        setTotalGrants(allFetchedGrants.length); // Mock total based on fetched for now
        
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch grants.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrants();
  }, [token, currentPage, limitPerPage]); // Add dependencies if they affect fetching

  if (isLoading) return <PageLoader isLoading={isLoading} />;
  if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;

  // Simple client-side pagination slice (replace with server-side if possible)
  const paginatedGrants = grants.slice(currentPage * limitPerPage, (currentPage + 1) * limitPerPage);
  const totalPages = Math.ceil(totalGrants / limitPerPage);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Available Grants</h1>
        <p className="text-muted-foreground">
          Explore funding opportunities for your research and projects.
        </p>
      </header>

      {grants.length === 0 && !isLoading && (
        <div className="text-center py-10 text-muted-foreground">
          No grants available at the moment. Please check back later.
        </div>
      )}

      {paginatedGrants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedGrants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button 
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} 
            disabled={currentPage === 0}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} 
            disabled={currentPage === totalPages - 1}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
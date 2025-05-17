'use client';

import { useEffect, useState } from 'react'; // Import useEffect and useState
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Briefcase, PlusCircle, Loader2 } from 'lucide-react'; // Added Loader2
import Link from "next/link";

// Interface for the raw data structure from the backend (matches schemas.Project)
interface BackendProjectData {
  id: number;
  title: string;
  description: string; // Available if needed for detail page
  category: string; // e.g., "technology", "science"
  status: string; // e.g., "open", "in_progress" (from ProjectStatus enum)
  expected_duration: string | null;
  required_skills: string[] | null;
  // budget: number | null; // Available
  // start_date: string | null; // Available (ISO date string)
  // end_date: string | null; // Available (ISO date string)
  creator: {
    id: number;
    full_name: string | null;
    // email: string | null; // Available
    // role: string; // Available
  } | null;
  // team_members: any[]; // Available if needed
  created_at: string; // Available (ISO datetime string)
  // updated_at: string | null; // Available
}

// Frontend-specific display interface (similar to your ProjectPosting)
interface ProjectDisplayData {
  id: string;
  title: string;
  postedBy: string;
  requiredSkills: string[];
  duration: string;
  status: string; // Will hold the backend status string directly
  category: string; // Added category
}

export default function ProjectBoardPage() {
  const [projects, setProjects] = useState<ProjectDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [searchTerm, setSearchTerm] = useState('');
  // const [filters, setFilters] = useState({});

  const mapBackendToDisplayData = (project: BackendProjectData): ProjectDisplayData => {
    return {
      id: project.id.toString(),
      title: project.title,
      postedBy: project.creator?.full_name || 'N/A',
      requiredSkills: project.required_skills || [],
      duration: project.expected_duration || 'Not specified',
      status: project.status, // Use backend status directly
      category: project.category.charAt(0).toUpperCase() + project.category.slice(1) || 'Other', // Capitalize
    };
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
          throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText} - ${errorData.detail}`);
        }
        const data: BackendProjectData[] = await response.json();
        setProjects(data.map(mapBackendToDisplayData));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Error fetching projects:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'default'; // Green or primary
      case 'in_progress':
        return 'secondary'; // Blue or another color
      case 'completed':
        return 'outline'; // Greyed out
      case 'on_hold':
        return 'secondary'; // Yellow or orange
      case 'cancelled':
        return 'destructive'; // Red
      default:
        return 'outline';
    }
  };
  
  const getStatusDisplayName = (status: string): string => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
        <p className="ml-2 text-gray-600">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
            <Briefcase className="mr-3 h-7 w-7 text-primary-blue" /> Project Board
          </h1>
          <p className="text-gray-600 mt-1">
            Find or post research project opportunities and collaborations.
          </p>
        </div>
         <Link href="/project-board/new">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Post New Project
            </Button>
         </Link>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search projects by title, skill, or researcher..."
            className="pl-10 w-full"
            // value={searchTerm}
            // onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex-shrink-0">
           <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Project List */}
      {projects.length === 0 && !isLoading && (
        <p className="text-gray-500 col-span-full text-center py-10">No open projects found.</p>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start mb-1">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <Badge variant={getStatusVariant(project.status)} className="text-xs capitalize">
                  {getStatusDisplayName(project.status)}
                </Badge>
              </div>
              <CardDescription>
                Posted by: {project.postedBy} <span className="text-gray-400 mx-1">•</span> Category: {project.category}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow text-sm space-y-3">
                <div>
                    <h4 className="font-medium mb-1 text-gray-600 text-xs uppercase tracking-wider">Required Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                        {project.requiredSkills.length > 0 ? 
                            project.requiredSkills.slice(0, 4).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="font-normal">{skill}</Badge>
                            )) : 
                            <span className="text-xs text-gray-500">Not specified</span>
                        }
                        {project.requiredSkills.length > 4 && <Badge variant="secondary" className="font-normal">...</Badge>}
                    </div>
                </div>
                 <div>
                    <h4 className="font-medium mb-1 text-gray-600 text-xs uppercase tracking-wider">Expected Duration:</h4>
                    <p className="text-gray-700">{project.duration}</p>
                 </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
                 <Link href={`/project-board/${project.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full hover:bg-primary-blue/10">View Details</Button>
                 </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
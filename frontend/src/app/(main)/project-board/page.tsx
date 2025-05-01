// src/app/(main)/project-board/page.tsx
'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Briefcase, PlusCircle } from 'lucide-react';
import Link from "next/link";

// Placeholder data structure for project postings
interface ProjectPosting {
  id: string;
  title: string;
  postedBy: string; // Researcher/Lead Name
  requiredSkills: string[];
  duration: string; // e.g., "3 Months", "Approx. 10 hrs/week"
  status: 'Open' | 'Filled' | 'Closed'; // Simplified status
}

// Placeholder data - replace with actual data fetching later
const projectData: ProjectPosting[] = [
  { id: 'p1', title: 'Frontend Development for Grant Platform UI', postedBy: 'Dr. Budi Santoso', requiredSkills: ['React', 'Next.js', 'Tailwind CSS'], duration: '4 Weeks', status: 'Open' },
  { id: 'p2', title: 'Lisk Smart Contract Auditing Assistant', postedBy: 'Prof. Adi Nugroho', requiredSkills: ['Solidity', 'Security Analysis', 'Foundry'], duration: 'Part-time, 2 Months', status: 'Open' },
  { id: 'p3', title: 'Data Analysis for Sensor Network Readings', postedBy: 'Dr. Rini Wulandari', requiredSkills: ['Python', 'Pandas', 'Signal Processing'], duration: 'Project-based (Est. 80 hours)', status: 'Closed' },
];

export default function ProjectBoardPage() {
  // State for search and filters (implement later)
  // const [searchTerm, setSearchTerm] = useState('');
  // const [filters, setFilters] = useState({});

  // Helper function to determine badge variant based on status
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
      switch (status.toLowerCase()) {
          case 'open': return 'default';
          case 'filled': return 'secondary';
          case 'closed': return 'outline';
          default: return 'secondary';
      }
  };

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
         {/* Implement filter dropdown/modal later */}
      </div>

      {/* Project List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projectData.map((project) => (
          <Card key={project.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg mb-1">{project.title}</CardTitle>
                <Badge variant={getStatusVariant(project.status)} className="text-xs capitalize">{project.status}</Badge>
              </div>
              <CardDescription>Posted by: {project.postedBy}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow text-sm space-y-2">
                <div>
                    <h4 className="font-medium mb-1 text-gray-600 text-xs uppercase tracking-wider">Required Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                        {project.requiredSkills.slice(0, 3).map((skill, index) => ( // Show only first few skills
                            <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                        {project.requiredSkills.length > 3 && <Badge variant="secondary">...</Badge>}
                    </div>
                </div>
                 <div>
                    <h4 className="font-medium mb-1 text-gray-600 text-xs uppercase tracking-wider">Duration:</h4>
                    <p className="text-gray-700">{project.duration}</p>
                 </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
                 <Link href={`/project-board/${project.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">View Details</Button>
                 </Link>
            </CardFooter>
          </Card>
        ))}
         {/* Add message if no projects found */}
         {projectData.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-10">No open projects found.</p>
         )}
      </div>
       {/* Add pagination controls here later */}
    </div>
  );
}

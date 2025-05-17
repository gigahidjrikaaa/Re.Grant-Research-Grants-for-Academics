'use client';

import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, UserPlus, Loader2, AlertTriangle, Edit3 } from "lucide-react"; // Added Edit3, Trash2
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // For navigation to edit page

// Interface for the raw data structure from the backend (matches schemas.Project)
interface BackendProjectDetailData {
  id: number;
  title: string;
  description: string;
  category: string; // e.g., "technology", "science" (enum value from backend)
  status: string; // e.g., "open", "in_progress" (enum value from backend)
  expected_duration: string | null;
  required_skills: string[] | null;
  budget: number | null;
  start_date: string | null; // ISO date string
  end_date: string | null; // ISO date string
  creator: { // from schemas.User
    id: number;
    full_name: string | null;
    // email: string | null; // Add if needed
  } | null;
  team_members: { // from schemas.ProjectTeamMember
    id: number; // ID of the ProjectTeamMember entry
    user: { // from schemas.User (nested within ProjectTeamMember)
        id: number; // User ID
        full_name: string | null;
    };
    role_in_project: string;
  }[];
  applications: { // from schemas.ProjectApplication
    id: number; // ID of the ProjectApplication entry
    user: { // from schemas.User (nested within ProjectApplication, assuming 'applicant' relationship points to User)
        id: number; // User ID
        full_name: string | null;
    };
    status: string; // e.g. "pending", "approved" (enum value from backend)
    application_date: string; // ISO date string
    // cover_letter: string; // Add if needed
  }[];
  created_at: string; // ISO datetime string
  // Add any other fields from schemas.Project you need
  // e.g., compensation_details: string | null; contact_info: string | null;
}

// Frontend-specific display interface
interface ProjectDetailDisplay {
  id: string;
  title: string;
  postedBy: string;
  creatorId?: number;
  requiredSkills: string[];
  duration: string;
  status: string;
  category: string;
  description: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  teamMembers: { id: string; userId: string; name: string; role: string }[];
  applicants: { id: string; userId: string; name: string; appliedDate: string; status: string }[];
}


export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const router = useRouter();

  const [projectDetails, setProjectDetails] = useState<ProjectDetailDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace with actual current user ID from auth context/store
  const currentUserId = 1; // Placeholder for current user's ID

  const mapBackendToDisplayData = (data: BackendProjectDetailData): ProjectDetailDisplay => {
    const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    return {
      id: data.id.toString(),
      title: data.title,
      postedBy: data.creator?.full_name || 'Anonymous',
      creatorId: data.creator?.id,
      requiredSkills: data.required_skills || [],
      duration: data.expected_duration || 'Not specified',
      status: data.status,
      category: data.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Other',
      description: data.description,
      budget: data.budget ? `~${data.budget.toLocaleString()} USD` : 'Not specified', // Assuming USD, adjust as needed
      startDate: formatDate(data.start_date),
      endDate: formatDate(data.end_date),
      createdAt: formatDate(data.created_at),
      teamMembers: data.team_members?.map(tm => ({
        id: tm.id.toString(), // ID of the team member entry
        userId: tm.user.id.toString(),
        name: tm.user.full_name || 'Unnamed Member',
        role: tm.role_in_project || 'Member'
      })) || [],
      applicants: data.applications?.map(app => ({
        id: app.id.toString(), // ID of the application entry
        userId: app.user.id.toString(),
        name: app.user.full_name || 'Unnamed Applicant',
        appliedDate: formatDate(app.application_date),
        status: app.status
      })) || [],
    };
  };

  useEffect(() => {
    if (!projectId) {
        setError("Project ID is missing.");
        setIsLoading(false);
        return;
    }

    const fetchProjectDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Project not found. It may have been removed or the ID is incorrect.');
          }
          const errorData = await response.json().catch(() => ({ detail: "An unknown server error occurred" }));
          throw new Error(`Failed to fetch project details: ${response.status} ${response.statusText} - ${errorData.detail}`);
        }
        const data: BackendProjectDetailData = await response.json();
        setProjectDetails(mapBackendToDisplayData(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data.');
        console.error("Error fetching project details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      case 'on_hold': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getStatusDisplayName = (status: string): string => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  }

  const isOwner = projectDetails?.creatorId === currentUserId;
  const hasApplied = projectDetails?.applicants.some(app => parseInt(app.userId) === currentUserId) || false;

  // --- Render Logic ---
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary-blue" />
            <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="mt-4 text-xl text-red-600">Error Loading Project</p>
            <p className="text-gray-500 max-w-md">{error}</p>
            <Button variant="outline" onClick={() => router.push('/project-board')} className="mt-6">
                Back to Project Board
            </Button>
        </div>
    );
  }

  if (!projectDetails) {
    // This case should ideally be covered by the error state if fetch fails or returns 404
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
            <p className="mt-4 text-xl text-gray-700">Project Data Unavailable</p>
            <p className="text-gray-500">Could not load project details. Please try again later.</p>
            <Button variant="outline" onClick={() => router.push('/project-board')} className="mt-6">
                Back to Project Board
            </Button>
        </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
       <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4 print:hidden">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
       </Button>

      <header className="pb-4 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start gap-2">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">{projectDetails.title}</h1>
                <p className="text-sm text-gray-500">Posted by: <span className="font-medium text-gray-700">{projectDetails.postedBy}</span> on {projectDetails.createdAt}</p>
            </div>
            <Badge variant={getStatusVariant(projectDetails.status)} className="text-sm capitalize mt-1 md:mt-0">
                {getStatusDisplayName(projectDetails.status)}
            </Badge>
        </div>
        <div className="mt-2 text-sm text-gray-600 space-x-4">
            <span>Category: <span className="font-medium">{projectDetails.category}</span></span>
            <span>Duration: <span className="font-medium">{projectDetails.duration}</span></span>
            {projectDetails.budget && <span>Budget: <span className="font-medium">{projectDetails.budget}</span></span>}
            {projectDetails.startDate !== 'N/A' && <span>Starts: <span className="font-medium">{projectDetails.startDate}</span></span>}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <main className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-xl">Project Description</CardTitle></CardHeader>
                <CardContent className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {projectDetails.description || "No description provided."}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-xl">Required Skills</CardTitle></CardHeader>
                <CardContent>
                    {projectDetails.requiredSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {projectDetails.requiredSkills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-sm">{skill}</Badge>
                            ))}
                        </div>
                    ) : <p className="text-sm text-gray-500">No specific skills listed.</p>}
                </CardContent>
            </Card>
        </main>

        {/* Sidebar Column */}
        <aside className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {projectDetails.status.toLowerCase() === 'open' && !isOwner && !hasApplied && (
                        <Button className="w-full bg-primary-blue hover:bg-primary-blue/90">
                            <Send className="mr-2 h-4 w-4"/> Apply to Project
                        </Button>
                    )}
                    {projectDetails.status.toLowerCase() === 'open' && !isOwner && hasApplied && (
                        <Button className="w-full" disabled>Already Applied</Button>
                    )}
                    {isOwner && (
                        <>
                            <Link href={`/project-board/${projectDetails.id}/edit`} passHref legacyBehavior>
                                <Button variant="outline" className="w-full">
                                    <Edit3 className="mr-2 h-4 w-4"/> Edit Project
                                </Button>
                            </Link>
                            {projectDetails.status.toLowerCase() === 'open' && (
                                <Button variant="outline" className="w-full">
                                    <UserPlus className="mr-2 h-4 w-4"/> Invite Talent
                                </Button>
                            )}
                            {/* <Button variant="destructiveOutline" className="w-full"> <Trash2 className="mr-2 h-4 w-4"/> Delete Project </Button> */}
                        </>
                    )}
                    {projectDetails.status.toLowerCase() !== 'open' && !isOwner && (
                        <p className="text-sm text-gray-500 text-center">This project is not currently open for applications.</p>
                    )}
                </CardContent>
            </Card>

            {projectDetails.teamMembers.length > 0 && (
                 <Card>
                    <CardHeader><CardTitle className="text-lg">Team Members ({projectDetails.teamMembers.length})</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm">
                            {projectDetails.teamMembers.map(member => (
                                <li key={member.userId} className="flex justify-between items-center">
                                    <Link href={`/profile/${member.userId}`} className="text-primary-blue hover:underline">{member.name}</Link>
                                    <Badge variant="outline" className="text-xs font-normal">{member.role}</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {isOwner && projectDetails.applicants.length > 0 && (
                 <Card>
                    <CardHeader><CardTitle className="text-lg">Applicants ({projectDetails.applicants.length})</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm">
                            {projectDetails.applicants.map(applicant => (
                                <li key={applicant.userId} className="p-2 border rounded-md">
                                    <div className="flex justify-between items-center">
                                        <Link href={`/profile/${applicant.userId}`} className="text-primary-blue hover:underline font-medium">{applicant.name}</Link>
                                        <Badge variant={getStatusVariant(applicant.status)} className="text-xs capitalize">
                                            {getStatusDisplayName(applicant.status)}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Applied: {applicant.appliedDate}</p>
                                    {/* TODO: Add Accept/Reject buttons for owner if status is 'pending' */}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </aside>
      </div>
    </div>
  );
}
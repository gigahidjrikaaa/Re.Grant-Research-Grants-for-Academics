// src/app/(main)/project-board/[projectId]/page.tsx
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, UserPlus } from "lucide-react";
// import Link from "next/link";
import { useRouter } from 'next/navigation'; // To navigate back

// Base project posting interface
interface ProjectPosting {
  id: string;
  title: string;
  postedBy: string;
  requiredSkills: string[];
  duration: string;
  status: string;
}

// Placeholder data structure for project details
interface ProjectDetail extends ProjectPosting {
    description: string;
    compensation?: string; // Optional compensation details
    contact?: string; // Optional direct contact
    visibility: 'Open' | 'Invite-only';
    applicants?: { id: string; name: string; appliedDate: string }[]; // For open projects
    invitedTalent?: { id: string; name: string; status: 'Sent' | 'Accepted' | 'Declined' }[]; // For invite-only
}

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const router = useRouter();

  // Placeholder data - replace with actual data fetching using projectId
  // In a real app, fetch this data in useEffect or using a server component + client child
  const projectDetails: ProjectDetail | null = {
    id: projectId,
    title: `Frontend Development for Grant Platform UI (ID: ${projectId})`,
    postedBy: 'Dr. Budi Santoso',
    requiredSkills: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Web3 Integration (Wagmi)'],
    duration: '4 Weeks (Full-time equivalent)',
    status: 'Open',
    description: 'We are looking for a skilled frontend developer (student or junior level) to help build key components for the Re.grant platform. The ideal candidate has experience with Next.js, Tailwind, and interacting with EVM blockchains. This is a great opportunity to contribute to a real-world Web3 project within the department.',
    compensation: 'Stipend available (IDRX equivalent, amount negotiable based on experience)',
    visibility: 'Open',
    contact: 'bsantoso@example.ac.id', // Or "Contact via platform message"
    applicants: [ { id: 't3', name: 'Bayu Putra', appliedDate: '2025-04-30' } ], // Example applicant
    invitedTalent: [],
  };

  // Helper function for status badge
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
      switch (status.toLowerCase()) {
          case 'open': return 'default';
          case 'filled': return 'secondary';
          case 'closed': return 'destructive';
          default: return 'outline';
      }
  };

  // TODO: Add logic to check if current user is the project owner
  const isOwner = true; // Placeholder

  // TODO: Add logic to check if current user has already applied
  const hasApplied = false; // Placeholder

  if (!projectDetails) {
    // Handle loading state or project not found
    return <div>Loading project details or project not found...</div>;
  }

  return (
    <div className="space-y-6">
       {/* Back Button */}
       <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project Board
       </Button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b">
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-1">{projectDetails.title}</h1>
            <p className="text-gray-600">Posted by: {projectDetails.postedBy}</p>
            <p className="text-sm text-gray-500">Duration: {projectDetails.duration}</p>
            {projectDetails.compensation && <p className="text-sm text-gray-500">Compensation: {projectDetails.compensation}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(projectDetails.status)} className="text-sm capitalize">{projectDetails.status}</Badge>
            <Badge variant={projectDetails.visibility === 'Open' ? 'outline' : 'secondary'} className="text-xs capitalize">{projectDetails.visibility}</Badge>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Project Description</CardTitle></CardHeader>
                <CardDescription className="text-gray-700 whitespace-pre-wrap">{projectDetails.description}</CardDescription>
            </Card>
            <Card>
                <CardHeader><CardTitle>Required Skills</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {projectDetails.requiredSkills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
             {projectDetails.contact && (
                 <Card>
                    <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
                    <CardContent><p className="text-gray-700">{projectDetails.contact}</p></CardContent>
                </Card>
             )}
        </div>

        {/* Right Column (Actions / Status) */}
        <div className="lg:col-span-1 space-y-6">
            {/* Action Buttons */}
            <Card>
                <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {projectDetails.status === 'Open' && projectDetails.visibility === 'Open' && !isOwner && !hasApplied && (
                        <Button className="w-full" > {/* TODO: Add onClick handler for apply */}
                            <Send className="mr-2 h-4 w-4"/> Apply to this Project
                        </Button>
                    )}
                     {projectDetails.status === 'Open' && projectDetails.visibility === 'Open' && !isOwner && hasApplied && (
                        <Button className="w-full" disabled>Applied</Button>
                    )}
                     {projectDetails.status === 'Open' && isOwner && (
                        <Button variant="outline" className="w-full" > {/* TODO: Link or open modal to invite */}
                            <UserPlus className="mr-2 h-4 w-4"/> Invite Talent
                        </Button>
                    )}
                     {isOwner && (
                         <Button variant="secondary" className="w-full" > {/* TODO: Link to edit page */}
                            Edit Project Posting
                         </Button>
                     )}
                     {/* Add more actions: Mark as Filled, Close Project etc. */}
                </CardContent>
            </Card>

            {/* Applicants Section (If Open & Owner) */}
            {isOwner && projectDetails.visibility === 'Open' && projectDetails.applicants && projectDetails.applicants.length > 0 && (
                 <Card>
                    <CardHeader><CardTitle>Applicants ({projectDetails.applicants.length})</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {projectDetails.applicants.map(applicant => (
                                <li key={applicant.id} className="flex justify-between items-center">
                                    {/* TODO: Link to applicant profile */}
                                    <span className="text-primary-blue hover:underline cursor-pointer">{applicant.name}</span>
                                    <span className="text-xs text-gray-500">Applied: {applicant.appliedDate}</span>
                                    {/* TODO: Add Accept/Reject buttons */}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

             {/* Invited Talent Section (If Owner) */}
            {isOwner && projectDetails.invitedTalent && projectDetails.invitedTalent.length > 0 && (
                 <Card>
                    <CardHeader><CardTitle>Invited Talent ({projectDetails.invitedTalent.length})</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {projectDetails.invitedTalent.map(invitee => (
                                <li key={invitee.id} className="flex justify-between items-center">
                                     {/* TODO: Link to invitee profile */}
                                    <span className="text-primary-blue hover:underline cursor-pointer">{invitee.name}</span>
                                    <Badge variant={invitee.status === 'Accepted' ? 'default' : invitee.status === 'Declined' ? 'destructive' : 'secondary'} className="text-xs capitalize">{invitee.status}</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

        </div>
      </div>
    </div>
  );
}

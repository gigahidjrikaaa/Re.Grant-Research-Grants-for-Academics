// frontend/src/app/(main)/dashboard/page.tsx
'use client';

import React from 'react';
import { useAccount } from 'wagmi'; // To get user address, connection status
// Import Shadcn UI components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
// Import Lucide icons
import {
  LayoutGrid, // Dashboard icon
  FileText,   // Grants
  Users,      // Talent Pool
  Briefcase,  // Project Board
  DollarSign, // Wallet/IDRX
  Bell,       // Notifications
  UserCircle, // Profile
  PlusCircle, // Create
  ExternalLink, // View Details
//   Settings,   // Manage
  ClipboardCheck, // Milestones
  ClipboardList, // Applicants
  Eye, // View
//   Edit3 // Edit
} from 'lucide-react';
import Link from 'next/link';
import { shortenAddress } from '@/lib/utils'; // Assuming you have this

// Placeholder data - In a real app, this would come from your backend/hooks
// based on the authenticated user.
interface UserDashboardData {
  userName: string;
  userRole: 'student' | 'researcher' | 'admin'; // Example roles
  idrxBalance: string; // e.g., "1,234.56 IDRX"
  activeApplicationsCount: number;
  ongoingProjectsCount: number;
  notificationsCount: number;
  myGrants: Array<{
    id: string;
    title: string;
    status: 'Active' | 'Pending Review' | 'Funded' | 'Completed' | 'Rejected';
    nextMilestone?: string; // e.g., "Milestone 2: Data Collection - Due May 30"
    applicantsCount?: number;
  }>;
  myApplications: Array<{
    id: string;
    grantTitle: string;
    piName: string;
    status: 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected';
  }>;
  myProjects: Array<{
    id: string;
    title: string;
    role: string; // e.g., "Lead Researcher", "Frontend Developer"
    status: 'Ongoing' | 'Completed';
  }>;
  profileCompletion?: number; // 0-100
}

// Example: Determine user role (replace with actual authentication logic)
const useUserRole = (): 'student' | 'researcher' | 'admin' => {
  // This is a placeholder. In a real app, you'd get this from your auth context/backend.
  // For now, let's cycle through them or allow a toggle for testing.
  // const roles = ['student', 'researcher', 'admin'];
  // const [roleIndex, setRoleIndex] = React.useState(0);
  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     setRoleIndex(prev => (prev + 1) % roles.length);
  //   }, 5000); // Cycle role every 5 seconds for demo
  //   return () => clearInterval(interval);
  // }, []);
  // return roles[roleIndex] as 'student' | 'researcher' | 'admin';
  return 'researcher'; // Default to researcher for now
};


export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const userRole = useUserRole(); // Placeholder for getting user role

  // TODO: Fetch actual dashboardData based on authenticated user and their role
  const dashboardData: UserDashboardData = {
    userName: isConnected && address ? shortenAddress(address) : 'Guest User',
    userRole: userRole,
    idrxBalance: '5,000.00 IDRX', // Placeholder
    activeApplicationsCount: userRole === 'student' ? 2 : 0,
    ongoingProjectsCount: 1,
    notificationsCount: 3,
    myGrants: userRole === 'researcher' ? [
      { id: 'g1', title: 'Lisk L2 Performance Analysis', status: 'Active', nextMilestone: 'Phase 2 Report - Due June 15', applicantsCount: 5 },
      { id: 'g2', title: 'Decentralized Identity on Lisk', status: 'Pending Review' },
    ] : [],
    myApplications: userRole === 'student' ? [
      { id: 'app1', grantTitle: 'AI in Education Grant', piName: 'Prof. X', status: 'Under Review' },
      { id: 'app2', grantTitle: 'Sustainable Energy Solutions', piName: 'Dr. Y', status: 'Submitted' },
    ] : [],
    myProjects: [
      { id: 'p1', title: 'Re.Grant Platform Development', role: 'Lead Developer', status: 'Ongoing' },
    ],
    profileCompletion: 75,
  };

  if (!isConnected) {
    // Optionally, show a more engaging "Please connect your wallet" message for dashboard access
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,10rem))]"> {/* Adjust height based on your header */}
        <LayoutGrid className="w-16 h-16 text-primary-blue mb-4" />
        <h1 className="text-2xl font-semibold mb-2 text-text-primary">Welcome to Your Dashboard</h1>
        <p className="text-text-secondary mb-6">Please connect your wallet to view your personalized dashboard.</p>
        {/* You can add your CustomConnectWalletButton here if it's not in the global header,
            but it's better if the global header handles connection. */}
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">
          Welcome back, {dashboardData.userName}!
        </h1>
        <Button variant="outline">
          <Bell className="mr-2 h-4 w-4" />
          Notifications <Badge variant="destructive" className="ml-2">{dashboardData.notificationsCount}</Badge>
        </Button>
      </div>

      {/* Quick Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.idrxBalance}</div>
            <p className="text-xs text-text-muted">Connected Lisk Wallet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === 'student' ? 'Active Applications' : 'Active Grants'}
            </CardTitle>
            <FileText className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRole === 'student' ? dashboardData.activeApplicationsCount : dashboardData.myGrants.filter(g => g.status === 'Active' || g.status === 'Funded').length}
            </div>
            <p className="text-xs text-text-muted">
              {userRole === 'student' ? 'Track your submissions' : 'Manage your funded research'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.ongoingProjectsCount}</div>
            <p className="text-xs text-text-muted">Projects you&apos;re involved in</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <UserCircle className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold capitalize">{dashboardData.userRole}</div>
            <Link href="/profile" className="text-xs text-primary-blue hover:underline">
              View/Edit Profile ({dashboardData.profileCompletion}%)
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid (Example: 2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column (Larger) */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Grants / My Applications Section */}
          <Card>
            <CardHeader>
              <CardTitle>{userRole === 'student' ? 'My Grant Applications' : 'My Grants'}</CardTitle>
              <CardDescription>
                {userRole === 'student' ? 'Status of your recent grant applications.' : 'Overview of grants you are managing or have proposed.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRole === 'researcher' && dashboardData.myGrants.length > 0 && dashboardData.myGrants.map(grant => (
                <Card key={grant.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-text-primary">{grant.title}</h4>
                      <Badge variant={grant.status === 'Active' || grant.status === 'Funded' ? 'default' : grant.status === 'Pending Review' ? 'secondary' : 'outline'} className="mt-1">
                        {grant.status}
                      </Badge>
                    </div>
                    <Link href={`/grants/${grant.id}`}>
                        <Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4"/>View</Button>
                    </Link>
                  </div>
                  {grant.nextMilestone && <p className="text-xs text-text-muted mt-2">Next: {grant.nextMilestone}</p>}
                  {grant.applicantsCount !== undefined && <p className="text-xs text-text-muted mt-1">{grant.applicantsCount} Applicants</p>}
                  <div className="flex space-x-2 mt-3">
                    {/* Researcher Actions */}
                    {grant.status === 'Active' && <Button size="sm" variant="outline"><ClipboardCheck className="mr-1 h-3 w-3"/>Milestones</Button>}
                    {grant.status === 'Pending Review' && <Button size="sm" variant="outline"><ClipboardList className="mr-1 h-3 w-3"/>Applicants</Button>}
                  </div>
                </Card>
              ))}
              {userRole === 'student' && dashboardData.myApplications.length > 0 && dashboardData.myApplications.map(app => (
                <Card key={app.id} className="p-4">
                     <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-text-primary">{app.grantTitle}</h4>
                            <p className="text-sm text-text-secondary">PI: {app.piName}</p>
                        </div>
                        <Badge variant={app.status === 'Accepted' ? 'default' : app.status === 'Under Review' ? 'secondary' : 'outline'}>{app.status}</Badge>
                    </div>
                     <Link href={`/grants/${app.id}/application`} className="mt-2 inline-block"> {/* Fictional path */}
                        <Button variant="outline" size="sm"><Eye className="mr-1 h-4 w-4"/>View Application</Button>
                    </Link>
                </Card>
              ))}
              {((userRole === 'researcher' && dashboardData.myGrants.length === 0) || (userRole === 'student' && dashboardData.myApplications.length === 0)) && (
                <p className="text-text-muted">No items to display.</p>
              )}
            </CardContent>
            {userRole === 'researcher' && (
                <CardFooter>
                    <Link href="/apply" className="w-full">
                        <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4"/> Apply for New Grant</Button>
                    </Link>
                </CardFooter>
            )}
          </Card>

          {/* My Projects Section (if applicable) */}
          {dashboardData.myProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Projects</CardTitle>
                <CardDescription>Projects you are actively involved in.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.myProjects.map(project => (
                  <Card key={project.id} className="p-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-semibold text-text-primary">{project.title}</h4>
                            <p className="text-xs text-text-muted">Your Role: {project.role}</p>
                        </div>
                        <Badge variant={project.status === 'Ongoing' ? 'default' : 'secondary'}>{project.status}</Badge>
                    </div>
                    <Link href={`/project-board/${project.id}`} className="mt-2 inline-block">
                        <Button variant="outline" size="sm"><ExternalLink className="mr-1 h-3 w-3"/>View Project</Button>
                    </Link>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (Smaller) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              <Link href="/grants"><Button variant="outline" className="w-full justify-start"><FileText className="mr-2 h-4 w-4"/>Browse Grants</Button></Link>
              <Link href="/talent-pool"><Button variant="outline" className="w-full justify-start"><Users className="mr-2 h-4 w-4"/>Explore Talent Pool</Button></Link>
              <Link href="/project-board"><Button variant="outline" className="w-full justify-start"><Briefcase className="mr-2 h-4 w-4"/>View Project Board</Button></Link>
              {userRole === 'researcher' && <Link href="/project-board/new"><Button variant="outline" className="w-full justify-start"><PlusCircle className="mr-2 h-4 w-4"/>Post a Project Need</Button></Link>}
            </CardContent>
          </Card>

          {/* Placeholder for Recent Activity/Notifications if not in header */}
          {/* <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent><p className="text-text-muted">No new activity.</p></CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
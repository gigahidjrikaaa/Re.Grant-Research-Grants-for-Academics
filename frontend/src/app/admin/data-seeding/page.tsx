'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  seedDummyUsers,
  seedDummyProfilesWithDetails,
  seedDummyPublications,
  seedDummyGrants,
  seedDummyProjects,
  seedDummyGrantApplications,
  seedDummyProjectApplications,
  seedAllSampleData,
//   SeedUsersPayload,
//   SeedProfilesPayload,
//   SeedPublicationsPayload,
//   SeedCountPayload,
//   SeedApplicationsPayload,
//   SeedAllPayload,
  SeedResponse
} from '@/lib/apiAdminService';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react'; // For loading spinner

// Zod Schemas for Form Validation
const seedUsersSchema = z.object({
  count: z.coerce.number().int().min(1, "Must be at least 1").max(50, "Max 50 users"),
});
type SeedUsersFormValues = z.infer<typeof seedUsersSchema>;

const seedProfilesSchema = z.object({
  num_recent_users: z.coerce.number().int().min(1).max(20),
  // user_ids can be added if needed, for now using recent users
});
type SeedProfilesFormValues = z.infer<typeof seedProfilesSchema>;

const seedPublicationsSchema = z.object({
  num_recent_profiles: z.coerce.number().int().min(1).max(20),
  pubs_per_profile_avg: z.coerce.number().int().min(1).max(10),
});
type SeedPublicationsFormValues = z.infer<typeof seedPublicationsSchema>;

const seedCountSchema = z.object({ // For Grants & Projects
  count: z.coerce.number().int().min(1).max(50),
});
type SeedCountFormValues = z.infer<typeof seedCountSchema>;

const seedApplicationsSchema = z.object({
  num_recent_targets: z.coerce.number().int().min(1).max(10),
  apps_per_target_avg: z.coerce.number().int().min(1).max(5),
  num_applicants: z.coerce.number().int().min(1).max(20),
});
type SeedApplicationsFormValues = z.infer<typeof seedApplicationsSchema>;

const seedAllSchema = z.object({
  num_users: z.coerce.number().int().min(1).max(100),
  num_grants: z.coerce.number().int().min(1).max(50),
  num_projects: z.coerce.number().int().min(1).max(50),
  pubs_per_profile_avg: z.coerce.number().int().min(0).max(10),
  apps_per_grant_avg: z.coerce.number().int().min(0).max(5),
  apps_per_project_avg: z.coerce.number().int().min(0).max(5),
});
type SeedAllFormValues = z.infer<typeof seedAllSchema>;


export default function DataSeedingPage() {
  const { token, user } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const usersForm = useForm<SeedUsersFormValues>({ resolver: zodResolver(seedUsersSchema), defaultValues: { count: 10 } });
  const profilesForm = useForm<SeedProfilesFormValues>({ resolver: zodResolver(seedProfilesSchema), defaultValues: { num_recent_users: 5 } });
  const publicationsForm = useForm<SeedPublicationsFormValues>({ resolver: zodResolver(seedPublicationsSchema), defaultValues: { num_recent_profiles: 5, pubs_per_profile_avg: 2 } });
  const grantsForm = useForm<SeedCountFormValues>({ resolver: zodResolver(seedCountSchema), defaultValues: { count: 5 } });
  const projectsForm = useForm<SeedCountFormValues>({ resolver: zodResolver(seedCountSchema), defaultValues: { count: 7 } });
  const grantAppsForm = useForm<SeedApplicationsFormValues>({ resolver: zodResolver(seedApplicationsSchema), defaultValues: { num_recent_targets: 3, apps_per_target_avg: 2, num_applicants: 5 } });
  const projectAppsForm = useForm<SeedApplicationsFormValues>({ resolver: zodResolver(seedApplicationsSchema), defaultValues: { num_recent_targets: 3, apps_per_target_avg: 2, num_applicants: 5 } });
  const allForm = useForm<SeedAllFormValues>({ resolver: zodResolver(seedAllSchema), defaultValues: { num_users: 20, num_grants: 8, num_projects: 12, pubs_per_profile_avg: 2, apps_per_grant_avg: 3, apps_per_project_avg: 2 } });

  const handleGenericSeed = async <T extends object>(
    actionName: string,
    apiCall: (payload: T, token: string | null) => Promise<SeedResponse>,
    payload: T
  ) => {
    if (!token || !user?.is_superuser) {
      toast.error('Unauthorized: Admin access required.');
      return;
    }
    setLoadingAction(actionName);
    try {
      const response = await apiCall(payload, token);
      let description = '';
      if (response.details) {
        description = Object.entries(response.details)
          .map(([key, value]) => `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}`)
          .join('; ');
      } else {
         description = Object.entries(response)
          .filter(([key, value]) => key !== 'message' && typeof value === 'number')
          .map(([key, value]) => `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}`)
          .join('; ');
      }
      toast.success(response.message, { description: description || "Operation successful." });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Seeding ${actionName} failed: ${errorMessage}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const renderLoadingButton = (actionName: string, buttonText: string) => (
    <Button type="submit" disabled={!!loadingAction} className="w-full">
      {loadingAction === actionName ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {loadingAction === actionName ? `Seeding ${actionName}...` : buttonText}
    </Button>
  );

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl lg:text-2xl font-bold">Admin Data Seeding Panel</CardTitle>
          <CardDescription>
            Use these tools to populate your database with sample data. Be cautious, especially in a production environment.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Seed Users */}
        <Card>
          <CardHeader><CardTitle>Seed Users</CardTitle></CardHeader>
          <Form {...usersForm}>
            <form onSubmit={usersForm.handleSubmit((data) => handleGenericSeed('Users', seedDummyUsers, data))} className="space-y-4">
              <CardContent>
                <FormField control={usersForm.control} name="count" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Users</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
              <CardFooter>{renderLoadingButton('Users', 'Seed Users')}</CardFooter>
            </form>
          </Form>
        </Card>

        {/* Seed Profiles */}
        <Card>
          <CardHeader><CardTitle>Seed Profiles & Details</CardTitle></CardHeader>
          <Form {...profilesForm}>
            <form onSubmit={profilesForm.handleSubmit((data) => handleGenericSeed('Profiles', seedDummyProfilesWithDetails, data))} className="space-y-4">
              <CardContent>
                <FormField control={profilesForm.control} name="num_recent_users" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Users to Create Profiles For</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormDescription>Creates profiles for this many recent non-admin users without one.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
              <CardFooter>{renderLoadingButton('Profiles', 'Seed Profiles')}</CardFooter>
            </form>
          </Form>
        </Card>

        {/* Seed Publications */}
        <Card>
          <CardHeader><CardTitle>Seed Publications</CardTitle></CardHeader>
          <Form {...publicationsForm}>
            <form onSubmit={publicationsForm.handleSubmit((data) => handleGenericSeed('Publications', seedDummyPublications, data))} className="space-y-4">
              <CardContent>
                <FormField control={publicationsForm.control} name="num_recent_profiles" render={({ field }) => (
                  <FormItem><FormLabel>Number of Profiles</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Adds publications to this many recent profiles.</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={publicationsForm.control} name="pubs_per_profile_avg" render={({ field }) => (
                  <FormItem><FormLabel>Avg. Pubs per Profile</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
              <CardFooter>{renderLoadingButton('Publications', 'Seed Publications')}</CardFooter>
            </form>
          </Form>
        </Card>

        {/* Seed Grants */}
        <Card>
          <CardHeader><CardTitle>Seed Grants</CardTitle></CardHeader>
          <Form {...grantsForm}>
            <form onSubmit={grantsForm.handleSubmit((data) => handleGenericSeed('Grants', seedDummyGrants, data))} className="space-y-4">
              <CardContent>
                <FormField control={grantsForm.control} name="count" render={({ field }) => (
                  <FormItem><FormLabel>Number of Grants</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
              <CardFooter>{renderLoadingButton('Grants', 'Seed Grants')}</CardFooter>
            </form>
          </Form>
        </Card>

        {/* Seed Projects */}
        <Card>
          <CardHeader><CardTitle>Seed Projects</CardTitle></CardHeader>
          <Form {...projectsForm}>
            <form onSubmit={projectsForm.handleSubmit((data) => handleGenericSeed('Projects', seedDummyProjects, data))} className="space-y-4">
              <CardContent>
                <FormField control={projectsForm.control} name="count" render={({ field }) => (
                  <FormItem><FormLabel>Number of Projects</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
              <CardFooter>{renderLoadingButton('Projects', 'Seed Projects')}</CardFooter>
            </form>
          </Form>
        </Card>
        
        {/* Seed Grant Applications */}
        <Card>
          <CardHeader><CardTitle>Seed Grant Applications</CardTitle></CardHeader>
          <Form {...grantAppsForm}>
            <form onSubmit={grantAppsForm.handleSubmit((data) => handleGenericSeed('GrantApps', seedDummyGrantApplications, data))} className="space-y-4">
              <CardContent>
                <FormField control={grantAppsForm.control} name="num_recent_targets" render={({ field }) => (
                  <FormItem><FormLabel>Number of Recent Grants</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={grantAppsForm.control} name="apps_per_target_avg" render={({ field }) => (
                  <FormItem><FormLabel>Avg. Apps per Grant</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={grantAppsForm.control} name="num_applicants" render={({ field }) => (
                  <FormItem><FormLabel>Number of Potential Applicants</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
              <CardFooter>{renderLoadingButton('GrantApps', 'Seed Grant Apps')}</CardFooter>
            </form>
          </Form>
        </Card>

        {/* Seed Project Applications */}
         <Card>
          <CardHeader><CardTitle>Seed Project Applications</CardTitle></CardHeader>
          <Form {...projectAppsForm}>
            <form onSubmit={projectAppsForm.handleSubmit((data) => handleGenericSeed('ProjectApps', seedDummyProjectApplications, data))} className="space-y-4">
              <CardContent>
                <FormField control={projectAppsForm.control} name="num_recent_targets" render={({ field }) => (
                  <FormItem><FormLabel>Number of Recent Projects</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={projectAppsForm.control} name="apps_per_target_avg" render={({ field }) => (
                  <FormItem><FormLabel>Avg. Apps per Project</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={projectAppsForm.control} name="num_applicants" render={({ field }) => (
                  <FormItem><FormLabel>Number of Potential Applicants</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
              <CardFooter>{renderLoadingButton('ProjectApps', 'Seed Project Apps')}</CardFooter>
            </form>
          </Form>
        </Card>


      </div>
      
      <Separator className="my-12" />

      {/* Seed All Data */}
      <Card className="mt-8 border-destructive">
        <CardHeader>
          <CardTitle className="text-red-600">Seed All Sample Data</CardTitle>
          <CardDescription>
            This will populate all major tables with a larger set of interconnected sample data. Use with caution.
          </CardDescription>
        </CardHeader>
        <Form {...allForm}>
          <form onSubmit={allForm.handleSubmit((data) => handleGenericSeed('AllData', seedAllSampleData, data))} className="space-y-1">
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField control={allForm.control} name="num_users" render={({ field }) => (
                <FormItem><FormLabel>Users</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={allForm.control} name="num_grants" render={({ field }) => (
                <FormItem><FormLabel>Grants</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={allForm.control} name="num_projects" render={({ field }) => (
                <FormItem><FormLabel>Projects</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={allForm.control} name="pubs_per_profile_avg" render={({ field }) => (
                <FormItem><FormLabel>Avg Pubs/Profile</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={allForm.control} name="apps_per_grant_avg" render={({ field }) => (
                <FormItem><FormLabel>Avg Apps/Grant</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={allForm.control} name="apps_per_project_avg" render={({ field }) => (
                <FormItem><FormLabel>Avg Apps/Project</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
            <CardFooter>
              {renderLoadingButton('AllData', 'Seed All Sample Data')}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
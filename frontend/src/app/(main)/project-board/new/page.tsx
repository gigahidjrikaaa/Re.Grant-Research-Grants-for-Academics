// src/app/(main)/project-board/new/page.tsx
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Use FormLabel below
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming Shadcn Select
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Assuming Shadcn Radio Group
import { Briefcase } from 'lucide-react';

// --- Zod Schema for Project Form ---
const projectFormSchema = z.object({
  title: z.string().min(5, { message: "Project title must be at least 5 characters." }),
  description: z.string().min(50, { message: "Description must be at least 50 characters." }),
  requiredSkills: z.string().min(3, { message: "Please list at least one required skill." }), // Simple comma-separated string for now
  duration: z.string().min(3, { message: "Please provide an estimated duration." }),
  compensation: z.string().optional(), // Optional text field
  contact: z.string().optional(), // Optional contact info
  visibility: z.enum(['Open', 'Invite-only'], { required_error: "Please select project visibility." }),
  // Add fields for target role if needed later
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

// --- Component ---
export default function CreateProjectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      requiredSkills: "",
      duration: "",
      compensation: "",
      contact: "",
      visibility: undefined, // Default to no selection
    },
    mode: 'onChange',
  });

  // --- Form Submission ---
  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    const submissionToastId = toast.loading("Posting Project", { description: "Please wait..." });

    console.log("Project Data:", data);

    // --- TODO: Implement actual submission logic ---
    // 1. Call backend API endpoint to create the project posting
    // 2. Backend saves data to the database
    // 3. Handle success/error responses

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      toast.success("Project Posted Successfully!", {
          id: submissionToastId,
          description: "Your project is now listed on the board.",
      });
      // Optionally reset form or redirect user
      // form.reset();
      // router.push('/project-board');
    } catch (error) {
      console.error("Posting failed:", error);
      toast.error("Posting Failed", {
          id: submissionToastId,
          description: "Could not post project. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center">
         <Briefcase className="mr-3 h-7 w-7 text-primary-blue" /> Post a New Project
      </h1>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Describe the project opportunity you want to post.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Develop Backend API for Re.grant" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl><Textarea placeholder="Describe the project scope, goals, tasks involved, and expected outcomes..." rows={6} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiredSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl><Input placeholder="e.g., Python, FastAPI, PostgreSQL, Solidity" {...field} /></FormControl>
                    <FormDescription>List key skills separated by commas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration / Effort</FormLabel>
                    <FormControl><Input placeholder="e.g., 3 Months Part-time, Approx. 100 hours total" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="compensation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compensation (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., IDRX Stipend, Course Credit, Volunteer" {...field} /></FormControl>
                     <FormDescription>Specify if there&apos;s any compensation offered.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., yourname@example.ac.id or 'Contact via platform message'" {...field} /></FormControl>
                     <FormDescription>How interested candidates should reach out.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Project Visibility</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="Open" /></FormControl>
                          <FormLabel className="font-normal">
                            Open for Applications (Visible to everyone on the board)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="Invite-only" /></FormControl>
                          <FormLabel className="font-normal">
                            Invite-only (Not listed publicly, you invite specific talent)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Posting..." : "Post Project"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

// src/app/(main)/apply/page.tsx
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// import Link from 'next/link';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { X as RemoveIcon, PlusCircle as AddIcon, Users as TeamIcon } from 'lucide-react'; // Added TeamIcon

// --- Zod Schema Updates ---

// Refined Milestone Schema
const milestoneSchema = z.object({
  // Removed description, replaced with criteria and deliverables
  acceptanceCriteria: z.string().min(10, { message: "Acceptance criteria must be at least 10 characters." }),
  proofAndDeliverables: z.string().min(10, { message: "Proof/Deliverables must be at least 10 characters." })
});

// Team Member Schema
const teamMemberSchema = z.object({
    name: z.string().min(3, { message: "Member name must be at least 3 characters."}),
    role: z.string().min(3, { message: "Member role must be at least 3 characters."})
    // Add affiliation/contact later if needed, consider privacy
});

// Updated Grant Form Schema
const grantFormSchema = z.object({
  title: z.string().min(5, { message: "Project title must be at least 5 characters." }),
  abstract: z.string().min(50, { message: "Abstract must be at least 50 characters." }).max(2000, { message: "Abstract cannot exceed 2000 characters." }),
  teamMembers: z.array(teamMemberSchema).min(1, { message: "At least one team member (Principal Investigator) is required." }), // Added Team Members
  amount: z.coerce.number({ invalid_type_error: "Amount must be a number." }).positive({ message: "Amount must be positive." }).int({ message: "Amount must be a whole number (no decimals for IDRX)." }),
  milestones: z.array(milestoneSchema).min(1, { message: "At least one milestone is required." }),
  document: z.any().optional(),
});

type GrantFormData = z.infer<typeof grantFormSchema>;

// --- Component ---
export default function ApplyGrantPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GrantFormData>({
    resolver: zodResolver(grantFormSchema),
    defaultValues: {
      title: "",
      abstract: "",
      teamMembers: [{ name: "", role: "Principal Investigator" }], // Start with PI
      amount: undefined,
      milestones: [{ acceptanceCriteria: "", proofAndDeliverables: "" }], // Updated milestone default
      document: undefined,
    },
    mode: 'onChange',
  });

  // Field Array for Milestones
  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  // Field Array for Team Members
  const { fields: teamMemberFields, append: appendTeamMember, remove: removeTeamMember } = useFieldArray({
      control: form.control,
      name: "teamMembers",
  });

  const totalSteps = 4; // Updated total number of steps

  // --- Step Navigation ---
  const nextStep = async () => {
    let fieldsToValidate: (keyof GrantFormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ['title', 'abstract'];
    if (currentStep === 2) fieldsToValidate = ['teamMembers']; // Validate team members step
    if (currentStep === 3) fieldsToValidate = ['amount', 'milestones']; // Validate budget/milestones step

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
        toast.error("Validation Error", {
            description: "Please fix the errors on this step before proceeding.",
        });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // --- File Handling (Simplified - Add validation as needed) ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (event.target.files[0].size > maxSize) {
          toast.error("File Too Large", { description: "Please upload a PDF smaller than 10MB." });
          setFile(null);
          event.target.value = '';
          return;
      }
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  // --- Form Submission ---
  const onSubmit = async (data: GrantFormData) => {
    if (currentStep !== totalSteps) return;
    if (!file) {
        toast.error("Missing Document", { description: "Please upload the supporting document." });
        return;
    }

    setIsSubmitting(true);
    const submissionToastId = toast.loading("Submitting Proposal", { description: "Please wait..." });

    console.log("Form Data:", data);
    console.log("File:", file);

    // --- TODO: Implement actual submission logic ---
    // 1. Upload 'file' to IPFS -> get ipfsHash
    // 2. Call backend API with 'data' and ipfsHash
    // 3. Backend handles smart contract interaction

    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      toast.success("Proposal Submitted Successfully!", {
          id: submissionToastId,
          description: "Your grant proposal has been sent for review.",
      });
      // Reset or redirect
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Submission Failed", {
          id: submissionToastId,
          description: "Could not submit proposal. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">Apply for Research Grant</h1>
      <p className="text-gray-600 mb-4">Follow the steps below to complete your application.</p>
      <Progress value={(currentStep / totalSteps) * 100} className="w-full mb-8 h-2" />

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: Project Information */}
            <div className={currentStep === 1 ? 'block' : 'hidden'}>
              <CardHeader>
                <CardTitle>Step 1: Project Information</CardTitle>
                <CardDescription className='mb-6'>Provide the core details about your research project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => ( /* ... Title field as before ... */
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the title of your research project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="abstract"
                  render={({ field }) => ( /* ... Abstract field as before ... */
                    <FormItem>
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Provide a summary of your research (50-2000 words)" rows={6} {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear and concise summary of the project goals, methods, and expected outcomes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </div>

            {/* Step 2: Team Members */}
            <div className={currentStep === 2 ? 'block' : 'hidden'}>
              <CardHeader>
                <CardTitle>Step 2: Team Members</CardTitle>
                <CardDescription className='mb-6'>List the key personnel involved in this research project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <FormLabel className="flex items-center mb-2"><TeamIcon className="mr-2 h-5 w-5"/> Research Team</FormLabel>
                  <FormDescription className="mb-3">
                    Include the Principal Investigator (PI) and other key members. At least the PI is required.
                  </FormDescription>
                  <div className="space-y-4">
                    {teamMemberFields.map((field, index) => (
                      <div key={field.id} className="flex items-start space-x-2 p-3 border rounded-md">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <FormField
                              control={form.control}
                              name={`teamMembers.${index}.name`}
                              render={({ field: memberField }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder={`Member ${index + 1} Name`} {...memberField} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`teamMembers.${index}.role`}
                              render={({ field: memberField }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Role</FormLabel>
                                  <FormControl>
                                    <Input placeholder={`e.g., Principal Investigator, Co-Investigator, Student Researcher`} {...memberField} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                        {/* Only allow removing if more than one member exists */}
                        {teamMemberFields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeTeamMember(index)} aria-label="Remove team member" className="mt-6"> {/* Adjust margin-top */}
                                <RemoveIcon className="h-4 w-4 text-red-500" />
                            </Button>
                        )}
                      </div>
                    ))}
                  </div>
                   <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => appendTeamMember({ name: "", role: "" })}
                    >
                      <AddIcon className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                    {/* Display top-level error for team members array */}
                    {form.formState.errors.teamMembers?.message && (
                         <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.teamMembers.message}</p>
                    )}
                     {form.formState.errors.teamMembers?.root?.message && (
                         <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.teamMembers.root.message}</p>
                    )}
                </div>
              </CardContent>
            </div>

            {/* Step 3: Budget & Milestones */}
            <div className={currentStep === 3 ? 'block' : 'hidden'}>
              <CardHeader>
                <CardTitle>Step 3: Budget & Milestones</CardTitle>
                <CardDescription className='mb-6'>Specify funding and define project milestones with clear criteria.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => ( /* ... Amount field as before ... */
                    <FormItem>
                      <FormLabel>Requested Amount (IDRX)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10000000" {...field} onChange={event => field.onChange(+event.target.value)} />
                      </FormControl>
                      <FormDescription>
                        Enter the total amount in IDRX (e.g., 10 million IDRX = 10000000). No decimals.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Milestones</FormLabel>
                  <FormDescription className="mb-3">
                    Define clear, sequential milestones. Use bullet points (-) for criteria and deliverables. At least one milestone is required.
                  </FormDescription>
                  <div className="space-y-4">
                    {milestoneFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-md space-y-3 bg-white relative">
                         <p className="font-medium text-sm">Milestone {index + 1}</p>
                         <FormField
                            control={form.control}
                            name={`milestones.${index}.acceptanceCriteria`}
                            render={({ field: milestoneField }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Acceptance Criteria</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="- Criterion 1&#10;- Criterion 2" {...milestoneField} rows={3} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`milestones.${index}.proofAndDeliverables`}
                            render={({ field: milestoneField }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Proof & Deliverables</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="- Deliverable A (e.g., Report PDF)&#10;- Deliverable B (e.g., Code Repository Link)" {...milestoneField} rows={3} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Remove Button - Positioned top-right */}
                          {milestoneFields.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeMilestone(index)} aria-label="Remove milestone" className="absolute top-2 right-2">
                                  <RemoveIcon className="h-4 w-4 text-red-500" />
                              </Button>
                          )}
                      </div>
                    ))}
                  </div>
                   <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => appendMilestone({ acceptanceCriteria: "", proofAndDeliverables: "" })}
                    >
                      <AddIcon className="mr-2 h-4 w-4" />
                      Add Milestone
                    </Button>
                    {/* Display top-level error for milestones array */}
                    {form.formState.errors.milestones?.message && (
                         <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.milestones.message}</p>
                    )}
                     {form.formState.errors.milestones?.root?.message && (
                         <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.milestones.root.message}</p>
                    )}
                </div>
              </CardContent>
            </div>

            {/* Step 4: Documents & Review */}
            <div className={currentStep === 4 ? 'block' : 'hidden'}>
              <CardHeader>
                <CardTitle>Step 4: Supporting Documents & Review</CardTitle>
                <CardDescription className='mb-6'>Upload your detailed proposal document and review your application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Review Section - Updated */}
                 <div>
                    <h3 className="text-lg font-medium mb-2">Review Your Details</h3>
                    <div className="space-y-3 text-sm p-4 border rounded-md bg-gray-50">
                        <p><strong>Title:</strong> {form.watch('title')}</p>
                        <p><strong>Abstract:</strong> {form.watch('abstract').substring(0, 150)}...</p>
                         <div><strong>Team:</strong>
                            <ul className="list-disc list-inside pl-4">
                                {form.watch('teamMembers').map((m, i) => (m.name || m.role) ? <li key={i}>{m.name} ({m.role})</li> : null)}
                            </ul>
                         </div>
                        <p><strong>Amount:</strong> {form.watch('amount')?.toLocaleString('id-ID') || 'N/A'} IDRX</p>
                        <div><strong>Milestones ({form.watch('milestones').length}):</strong>
                            <ul className="space-y-3 pl-2">
                                {form.watch('milestones').map((m, i) => (
                                    <li key={i} className="border-l-2 border-blue-200 pl-3 py-1">
                                        <span className="font-medium text-sm block mb-1">Milestone {i + 1}</span>
                                        {m.acceptanceCriteria && (
                                            <div className="text-xs text-gray-700 mb-1">
                                                <span className="font-medium">Criteria:</span>
                                                <ul className="mt-1 space-y-0.5">
                                                    {m.acceptanceCriteria.split('\n')
                                                        .filter(line => line.trim())
                                                        .slice(0, 2)
                                                        .map((line, idx) => (
                                                            <li key={idx} className="ml-2">
                                                                • {line.startsWith('- ') ? line.substring(2) : line}
                                                            </li>
                                                        ))}
                                                </ul>
                                                {m.acceptanceCriteria.split('\n').filter(line => line.trim()).length > 2 && 
                                                    <span className="text-xs text-gray-500">...</span>}
                                            </div>
                                        )}
                                        {m.proofAndDeliverables && (
                                            <div className="text-xs text-gray-700 mb-1">
                                                <span className="font-medium">Deliverables:</span>
                                                <ul className="mt-1 space-y-0.5">
                                                    {m.proofAndDeliverables.split('\n')
                                                        .filter(line => line.trim())
                                                        .slice(0, 2)
                                                        .map((line, idx) => (
                                                            <li key={idx} className="ml-2">
                                                                • {line.startsWith('- ') ? line.substring(2) : line}
                                                            </li>
                                                        ))}
                                                </ul>
                                                {m.proofAndDeliverables.split('\n').filter(line => line.trim()).length > 2 && 
                                                    <span className="text-xs text-gray-500">...</span>}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                 </div>

                {/* File Upload */}
                 <FormItem>
                    <FormLabel htmlFor="documents">Supporting Document (PDF)</FormLabel>
                    <FormControl>
                        <Input id="documents" type="file" accept=".pdf" onChange={handleFileChange} required={currentStep === totalSteps} />
                    </FormControl>
                    <FormDescription>
                        Upload your detailed proposal document (max 10MB). Required for submission.
                    </FormDescription>
                    {file && <p className="text-sm text-muted-foreground mt-1">Selected: {file.name}</p>}
                 </FormItem>
              </CardContent>
            </div>

            {/* Navigation Footer */}
            <CardFooter className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1 || isSubmitting}>
                Previous
              </Button>
              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                  Next (Step {currentStep + 1} of {totalSteps})
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || !file}>
                  {isSubmitting ? "Submitting..." : "Submit Proposal"}
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

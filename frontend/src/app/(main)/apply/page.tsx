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
import { Checkbox } from "@/components/ui/checkbox";
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
  const [currentStep, setCurrentStep] = useState(0); // Step 0 is the understanding step
  const [hasUnderstoodStep0, setHasUnderstoodStep0] = useState(false); // State for Step 0 agreement
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

  const totalSteps = 5; // Updated total number of steps

  // --- Step Navigation ---
  const nextStep = async () => {
    if (currentStep === 0) { // Step 0: Understanding
      if (!hasUnderstoodStep0) {
        toast.error("Acknowledgement Required", {
          description: "Please acknowledge that you understand the application process.",
        });
        return;
      }
      setCurrentStep((prev) => prev + 1);
      return;
    }
    if (currentStep === totalSteps) return; // Prevent going beyond last step

    let fieldsToValidate: (keyof GrantFormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ['title', 'abstract'];
    if (currentStep === 2) fieldsToValidate = ['teamMembers']; // Validate team members step
    if (currentStep === 3) fieldsToValidate = ['amount', 'milestones']; // Validate budget/milestones step

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      } else {
          toast.error("Validation Error", {
              description: "Please fix the errors on this step before proceeding.",
          });
      }
    } else {
      // For steps without specific RHF validation before moving (like Step 0 handled above, or if Step 4 had no RHF fields)
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0)); // Prevent going below Step 0
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
    if (currentStep !== totalSteps - 1) {
      console.warn("onSubmit called on incorrect step:", currentStep);
      return;
    }
    
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
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-2 text-center">Apply for Research Grant</h1>
      <p className="text-gray-600 mb-6 text-center">Follow the steps below to complete your application.</p>
      {/* Progress: currentStep is 0-indexed, so add 1 for display and calculation if totalSteps is the count */}
      <Progress value={((currentStep + 1) / totalSteps) * 100} className="w-full mb-8 h-2.5" />

      <Card className="shadow-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 0: Understanding Grant Application */}
            <div className={currentStep === 0 ? 'block' : 'hidden'}>
              <CardHeader>
                <CardTitle>Step 0: Understanding Your Grant Application</CardTitle>
                <CardDescription className='mb-4 text-base'>
                  Welcome to the Re.Grant application process. Before you begin, please read the following carefully.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  You are about to propose a research project for potential funding. This involves submitting a detailed plan outlining your project&apos;s objectives, methodology, team, budget, and expected outcomes.
                </p>
                <h3 className="font-semibold text-lg text-gray-800 pt-2">Key Considerations:</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong>Project Proposal:</strong> Your application is a formal proposal for a specific research project. Ensure your ideas are well-defined and clearly articulated.</li>
                  <li><strong>Accuracy:</strong> All information provided must be accurate and truthful. Misrepresentation can lead to disqualification.</li>
                  <li><strong>Completeness:</strong> Ensure all required sections are completed thoroughly. Incomplete applications may not be reviewed.</li>
                  <li><strong>Supporting Documents:</strong> You will be required to upload a primary proposal document (PDF format) in the final step. This document should contain the comprehensive details of your project. The fields in this form help summarize and structure key information for initial review and on-chain data.</li>
                  <li><strong>Review Process:</strong> Submitted proposals will undergo a review process. You will be notified of the outcome.</li>
                  <li><strong>Terms & Conditions:</strong> By submitting this application, you agree to the Re.Grant platform&apos;s <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a>.</li>
                </ul>
                <div className="pt-4 flex items-center space-x-2">
                  <Checkbox
                    id="understand-step0"
                    checked={hasUnderstoodStep0}
                    onCheckedChange={(checked) => setHasUnderstoodStep0(checked as boolean)}
                  />
                  <label
                    htmlFor="understand-step0"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read and understand the information above and wish to proceed with my grant application.
                  </label>
                </div>
              </CardContent>
            </div>

            {/* Step 1: Project Information (was Step 1) */}
            <div className={currentStep === 1 ? 'block' : 'hidden'}>
              <CardHeader>
                <CardTitle>Step 1: Project Information</CardTitle>
                <CardDescription className='mb-6'>Provide the core details about your research project.</CardDescription>
              </CardHeader>
              {/* ... Content for Step 1 (Project Info) remains the same ... */}
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Provide a summary of your research (50-2000 characters)" rows={6} {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear and concise summary of the project goals, methods, and expected outcomes. Max 2000 characters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </div>

            {/* Step 2: Team Members (was Step 2) */}
            <div className={currentStep === 2 ? 'block' : 'hidden'}>
              <CardHeader>
                <CardTitle>Step 2: Team Members</CardTitle>
                <CardDescription className='mb-6'>List the key personnel involved in this research project.</CardDescription>
              </CardHeader>
              {/* ... Content for Step 2 (Team Members) remains the same ... */}
              <CardContent className="space-y-6">
                <div>
                  <FormLabel className="flex items-center mb-2"><TeamIcon className="mr-2 h-5 w-5"/> Research Team</FormLabel>
                  <FormDescription className="mb-3">
                    Include the Principal Investigator (PI) and other key members. At least the PI is required.
                  </FormDescription>
                  <div className="space-y-4">
                    {teamMemberFields.map((field, index) => (
                      <div key={field.id} className="flex items-start space-x-2 p-3 border rounded-md bg-background">
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
                                    <Input 
                                        placeholder={index === 0 ? "Principal Investigator" : "e.g., Co-Investigator"} 
                                        {...memberField} 
                                        defaultValue={index === 0 && !memberField.value ? "Principal Investigator" : memberField.value}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                        {teamMemberFields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeTeamMember(index)} aria-label="Remove team member" className="mt-6 sm:mt-5">
                                <RemoveIcon className="h-4 w-4 text-destructive" />
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
                    {form.formState.errors.teamMembers?.message && (
                         <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.teamMembers.message}</p>
                    )}
                     {form.formState.errors.teamMembers?.root?.message && (
                         <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.teamMembers.root.message}</p>
                    )}
                </div>
              </CardContent>
            </div>

            {/* Step 3: Budget & Milestones (was Step 3) */}
            <div className={currentStep === 3 ? 'block' : 'hidden'}>
              <CardHeader>
                <CardTitle>Step 3: Budget & Milestones</CardTitle>
                <CardDescription className='mb-6'>Specify funding and define project milestones with clear criteria. Milestones help track progress and may be tied to fund disbursement.</CardDescription>
              </CardHeader>
              {/* ... Content for Step 3 (Budget & Milestones) remains the same ... */}
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested Amount (IDRX)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10000000" {...field} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} />
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
                      <div key={field.id} className="p-4 border rounded-md space-y-3 bg-background relative">
                         <p className="font-medium text-sm">Milestone {index + 1}</p>
                         <FormField
                            control={form.control}
                            name={`milestones.${index}.acceptanceCriteria`}
                            render={({ field: milestoneField }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Acceptance Criteria</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="- Criterion 1 (e.g., Phase 1 completed)&#10;- Criterion 2 (e.g., Report submitted)" {...milestoneField} rows={3} />
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
                                  <Textarea placeholder="- Deliverable A (e.g., Research Paper Draft)&#10;- Deliverable B (e.g., Link to Demo)" {...milestoneField} rows={3} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {milestoneFields.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeMilestone(index)} aria-label="Remove milestone" className="absolute top-2 right-2">
                                  <RemoveIcon className="h-4 w-4 text-destructive" />
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
                    {form.formState.errors.milestones?.message && (
                         <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.milestones.message}</p>
                    )}
                     {form.formState.errors.milestones?.root?.message && (
                         <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.milestones.root.message}</p>
                    )}
                </div>
              </CardContent>
            </div>

            {/* Step 4: Documents & Review (was Step 4) */}
            <div className={currentStep === 4 ? 'block' : 'hidden'}>
              <CardHeader>
                <CardTitle>Step 4: Supporting Documents & Review</CardTitle>
                <CardDescription className='mb-6'>
                    Upload your detailed proposal document (PDF). The information entered in previous steps summarizes key aspects for initial review. Then, review your complete application before submission.
                </CardDescription>
              </CardHeader>
              {/* ... Content for Step 4 (Documents & Review) remains the same, but ensure the CardDescription above is updated ... */}
              <CardContent className="space-y-6">
                 <div>
                    <h3 className="text-lg font-medium mb-3">Review Your Application Details</h3>
                    <div className="space-y-4 text-sm p-4 border rounded-md bg-muted/50">
                        <p><strong>Title:</strong> {form.watch('title') || <span className="text-muted-foreground italic">Not provided</span>}</p>
                        <div>
                            <strong>Abstract:</strong>
                            <p className="whitespace-pre-wrap text-muted-foreground text-xs mt-1 p-2 bg-background rounded">
                                {form.watch('abstract')?.substring(0, 300) || <span className="italic">Not provided</span>}
                                {form.watch('abstract')?.length > 300 && '...'}
                            </p>
                        </div>
                         <div><strong>Team Members ({form.watch('teamMembers').length}):</strong>
                            <ul className="list-disc list-inside pl-4 mt-1">
                                {form.watch('teamMembers').map((m, i) => (m.name || m.role) ? <li key={i}>{m.name || <span className="italic text-muted-foreground">Unnamed Member</span>} ({m.role || <span className="italic text-muted-foreground">No role</span>})</li> : null)}
                            </ul>
                         </div>
                        <p><strong>Requested Amount:</strong> {form.watch('amount')?.toLocaleString('id-ID') || <span className="text-muted-foreground italic">Not provided</span>} IDRX</p>
                        <div><strong>Milestones ({form.watch('milestones').length}):</strong>
                            <ul className="space-y-3 pl-2 mt-1">
                                {form.watch('milestones').map((m, i) => (
                                    <li key={i} className="border-l-2 border-primary/30 pl-3 py-1.5 bg-background rounded-r-md">
                                        <span className="font-semibold text-xs block mb-1.5 text-primary">Milestone {i + 1}</span>
                                        {m.acceptanceCriteria && (
                                            <div className="text-xs text-muted-foreground mb-1.5">
                                                <span className="font-medium text-foreground">Acceptance Criteria:</span>
                                                <ul className="mt-0.5 space-y-0.5">
                                                    {m.acceptanceCriteria.split('\n')
                                                        .filter(line => line.trim())
                                                        .slice(0, 3) // Show up to 3 lines
                                                        .map((line, idx) => (
                                                            <li key={idx} className="ml-2">
                                                                • {line.startsWith('- ') ? line.substring(2) : line}
                                                            </li>
                                                        ))}
                                                </ul>
                                                {m.acceptanceCriteria.split('\n').filter(line => line.trim()).length > 3 && 
                                                    <span className="text-xs text-muted-foreground/70 ml-2">... (see full document for more)</span>}
                                            </div>
                                        )}
                                        {m.proofAndDeliverables && (
                                            <div className="text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground">Proof & Deliverables:</span>
                                                <ul className="mt-0.5 space-y-0.5">
                                                    {m.proofAndDeliverables.split('\n')
                                                        .filter(line => line.trim())
                                                        .slice(0, 3) // Show up to 3 lines
                                                        .map((line, idx) => (
                                                            <li key={idx} className="ml-2">
                                                                • {line.startsWith('- ') ? line.substring(2) : line}
                                                            </li>
                                                        ))}
                                                </ul>
                                                {m.proofAndDeliverables.split('\n').filter(line => line.trim()).length > 3 && 
                                                    <span className="text-xs text-muted-foreground/70 ml-2">... (see full document for more)</span>}
                                            </div>
                                        )}
                                        {(!m.acceptanceCriteria && !m.proofAndDeliverables) && <span className="italic text-xs text-muted-foreground">No details provided for this milestone.</span>}
                                    </li>
                                ))}
                                {form.watch('milestones').length === 0 && <li className="italic text-xs text-muted-foreground">No milestones defined.</li>}
                            </ul>
                        </div>
                    </div>
                 </div>

                 <FormItem className="pt-2">
                    <FormLabel htmlFor="documents">Upload Full Proposal Document (PDF)</FormLabel>
                    <FormControl>
                        <Input id="documents" type="file" accept=".pdf" onChange={handleFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    </FormControl>
                    <FormDescription>
                        This is your main proposal document. Ensure it&apos;s detailed and complete (max 10MB). Required for submission.
                    </FormDescription>
                    {file && <p className="text-sm text-green-600 mt-1">Selected: {file.name}</p>}
                    {!file && currentStep === totalSteps -1 && <p className="text-sm text-destructive mt-1">Document is required for submission.</p>}
                 </FormItem>
              </CardContent>
            </div>

            {/* Navigation Footer */}
            <CardFooter className="flex justify-between pt-8 mt-2 border-t">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
                Previous
              </Button>
              {currentStep < totalSteps - 1 ? ( // Check if not the last step
                <Button type="button" onClick={nextStep} disabled={isSubmitting || (currentStep === 0 && !hasUnderstoodStep0)}>
                  Next (Step {currentStep + 1 + 1} of {totalSteps}) {/* Display user-friendly step numbers */}
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

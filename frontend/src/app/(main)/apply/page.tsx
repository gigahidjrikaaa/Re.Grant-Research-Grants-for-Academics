// src/app/(main)/apply/page.tsx
// Grant Application Page

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function ApplyGrantPage() {

  // TODO: Implement form handling (e.g., using react-hook-form)
  // TODO: Implement IPFS upload logic
  // TODO: Implement interaction with backend/smart contract

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Apply for Research Grant</h1>

      <Card>
        <CardHeader>
          <CardTitle>Grant Proposal Details</CardTitle>
          <CardDescription>Fill in the details below to submit your grant proposal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input id="title" placeholder="Enter the title of your research project" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea id="abstract" placeholder="Provide a brief summary of your research (max 500 words)" rows={5} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="amount">Requested Amount (IDRX)</Label>
            <Input id="amount" type="number" placeholder="e.g., 10000000" />
            <p className="text-xs text-gray-500">Enter the total amount requested in IDRX (e.g., 10 million IDRX = 10000000).</p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="milestones">Milestones</Label>
            <Textarea id="milestones" placeholder="Define clear milestones for your project, one per line." rows={4} />
             <p className="text-xs text-gray-500">Funding may be released upon completion of milestones.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="documents">Supporting Documents (PDF)</Label>
            <Input id="documents" type="file" accept=".pdf" />
             <p className="text-xs text-gray-500">Upload your detailed proposal document.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Submit Proposal</Button> {/* Add onClick handler later */}
        </CardFooter>
      </Card>
    </div>
  );
}
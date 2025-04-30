// src/app/(main)/grants/[grantId]/page.tsx
// Grant Detail Page

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// This component needs to fetch data based on the grantId param
export default function GrantDetailPage({ params }: { params: { grantId: string } }) {
  const { grantId } = params;

  // Placeholder data - replace with actual data fetching using grantId
  const grantDetails = {
    id: grantId,
    title: `Details for Grant ${grantId}`,
    pi: 'Dr. Budi Santoso (Placeholder)',
    status: 'Active',
    amount: '5,000,000 IDRX',
    abstract: 'This is a placeholder abstract describing the research project. It leverages Lisk L2 technology to analyze performance metrics under various load conditions. The goal is to provide benchmarks for future dApp development.',
    milestones: [
      { id: 'm1', description: 'Phase 1: Setup Test Environment', status: 'Completed', funded: true },
      { id: 'm2', description: 'Phase 2: Run Initial Benchmarks', status: 'In Progress', funded: false },
      { id: 'm3', description: 'Phase 3: Final Report Submission', status: 'Pending', funded: false },
    ],
    documents: [ { name: 'Proposal.pdf', ipfsHash: 'Qm...' } ] // Example
  };

  // Helper function to determine badge variant based on status
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
      switch (status.toLowerCase()) {
          case 'active':
          case 'in progress':
              return 'default';
          case 'completed':
          case 'funded':
              return 'default';
          case 'pending review':
          case 'pending':
              return 'secondary';
          case 'rejected':
              return 'destructive';
          default:
              return 'outline';
      }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-1">{grantDetails.title}</h1>
            <p className="text-gray-600">Principal Investigator: {grantDetails.pi}</p>
            <p className="text-gray-600">Total Amount: {grantDetails.amount}</p>
        </div>
        <Badge variant={getStatusVariant(grantDetails.status)} className="text-sm capitalize">{grantDetails.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abstract</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{grantDetails.abstract}</p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {grantDetails.milestones.map((milestone) => (
              <li key={milestone.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
                <span>{milestone.description}</span>
                <Badge variant={getStatusVariant(milestone.status)} className="capitalize">{milestone.status}</Badge>
                {/* Add button to submit evidence if applicable */}
              </li>
            ))}
          </ul>
          {/* Add button for Admin to approve next milestone */}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardDescription>Supporting documents related to the grant proposal.</CardDescription>
        <CardContent>
           {/* List documents with links to IPFS */}
           <ul className="list-disc list-inside">
             {grantDetails.documents.map(doc => (
                <li key={doc.ipfsHash}>
                    <a href={`https://ipfs.io/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-primary-blue hover:underline">
                        {doc.name}
                    </a>
                </li>
             ))}
           </ul>
        </CardContent>
      </Card>

      {/* Add section for transaction history later */}
    </div>
  );
}
// src/app/(main)/grants/[grantId]/page.tsx
// Grant Detail Page

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { notFound } from 'next/navigation'; // Uncomment if you want to use notFound() for missing grants

type GrantMilestone = {
  id: string;
  description: string;
  status: string;
  funded: boolean;
};

type GrantDocument = {
  name: string;
  ipfsHash: string;
};

type GrantDetails = {
  id: string;
  title: string;
  pi: string;
  status: string;
  amount: string;
  abstract: string;
  milestones: GrantMilestone[];
  documents: GrantDocument[];
};

type GrantDetailPageParams = {
  grantId: string;
};

type GrantDetailPageProps = {
  params: GrantDetailPageParams;
  // searchParams?: { [key: string]: string | string[] | undefined }; // Add if you use searchParams
};

// Helper function to simulate fetching grant details
async function fetchGrantDetailsById(grantId: string): Promise<GrantDetails | null> {
  console.log(`Fetching details for grant: ${grantId}`);
  // Replace this with your actual data fetching logic (e.g., API call)
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulating data found
      if (grantId === "error") { // Simulate not found
          resolve(null);
          return;
      }
      resolve({
        id: grantId,
        title: `Research on Advanced Lisk L2 Scaling Solutions - Grant ${grantId}`,
        pi: 'Dr. Chandra Wijaya (Fetched)',
        status: 'Active', // Example statuses: Active, Completed, Pending Review, Rejected
        amount: '15,000,000 IDRX',
        abstract: `This research project aims to explore and develop novel layer 2 scaling solutions on the Lisk blockchain. By focusing on ${grantId}, we intend to enhance transaction throughput and reduce latency, paving the way for more complex decentralized applications. The project involves theoretical analysis, prototype development, and rigorous performance benchmarking.`,
        milestones: [
          { id: 'm1', description: 'Literature Review and Theoretical Framework', status: 'Completed', funded: true },
          { id: 'm2', description: 'Prototype Development of Scaling Solution', status: 'In Progress', funded: true },
          { id: 'm3', description: 'Benchmarking and Performance Analysis', status: 'Pending', funded: false },
          { id: 'm4', description: 'Final Report and Dissemination', status: 'Pending', funded: false },
        ],
        documents: [
          { name: `Grant_Proposal_${grantId}.pdf`, ipfsHash: 'QmXyZ...ExampleHash1' },
          { name: `Ethics_Approval_${grantId}.pdf`, ipfsHash: 'QmAbC...ExampleHash2' },
        ],
      });
    }, 750); // Simulate network delay
  });
}

// This component fetches data based on the grantId param, so it's an async Server Component.
export default async function GrantDetailPage({ params }: GrantDetailPageProps) {
  const { grantId } = params;

  const grantDetails = await fetchGrantDetailsById(grantId);

  if (!grantDetails) {
    // If grant is not found, you can use Next.js's notFound() function
    // to render the nearest not-found.tsx page.
    // notFound();
    // Alternatively, render a custom message:
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h1 className="text-2xl font-semibold text-destructive mb-4">Grant Not Found</h1>
        <p className="text-muted-foreground">
          The grant with ID <span className="font-medium">{grantId}</span> could not be found.
        </p>
      </div>
    );
  }

  // Helper function to determine badge variant based on status
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
      switch (status.toLowerCase()) {
          case 'active':
          case 'in progress':
              return 'default'; // Or a specific 'info' or 'primary' color if defined
          case 'completed':
          case 'funded':
              return 'default'; // Using default instead of success
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
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b">
        <div className="flex-grow">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{grantDetails.title}</h1>
            <p className="text-sm text-muted-foreground">Principal Investigator: {grantDetails.pi}</p>
            <p className="text-sm text-muted-foreground">Total Amount: <span className="font-semibold text-primary">{grantDetails.amount}</span></p>
        </div>
        <Badge variant={getStatusVariant(grantDetails.status)} className="text-sm capitalize px-3 py-1.5 self-start sm:self-auto mt-2 sm:mt-0">
          {grantDetails.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Abstract</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{grantDetails.abstract}</p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="text-xl">Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          {grantDetails.milestones && grantDetails.milestones.length > 0 ? (
            <ul className="space-y-3">
              {grantDetails.milestones.map((milestone) => (
                <li key={milestone.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors gap-2">
                  <span className="text-sm md:text-base text-card-foreground flex-grow">{milestone.description}</span>
                  <Badge variant={getStatusVariant(milestone.status)} className="capitalize text-xs px-2 py-1 self-start sm:self-auto">
                    {milestone.status}
                    {milestone.funded && milestone.status.toLowerCase() !== 'completed' && ' (Funded)'}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No milestones defined for this grant yet.</p>
          )}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="text-xl">Documents</CardTitle>
          {grantDetails.documents && grantDetails.documents.length > 0 && (
            <CardDescription>Supporting documents related to the grant proposal.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
           {grantDetails.documents && grantDetails.documents.length > 0 ? (
             <ul className="list-disc list-inside space-y-1 pl-2">
               {grantDetails.documents.map(doc => (
                  <li key={doc.ipfsHash}>
                      <a href={`https://ipfs.io/ipfs/${doc.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm md:text-base">
                          {doc.name}
                      </a>
                  </li>
               ))}
             </ul>
           ) : (
             <p className="text-sm text-muted-foreground">No documents uploaded for this grant.</p>
           )}
        </CardContent>
      </Card>

      {/* Potential future section:
      <Card>
        <CardHeader><CardTitle className="text-xl">Transaction History</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Transaction history will be displayed here.</p></CardContent>
      </Card>
      */}
    </div>
  );
}
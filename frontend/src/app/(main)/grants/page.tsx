// src/app/(main)/grants/page.tsx
// Grant Listing Page

import { Button } from "@/components/ui/button"; // Assuming Shadcn Button
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // Assuming Shadcn Card
import Link from "next/link";

export default function GrantsListPage() {
  // Placeholder data - replace with actual data fetching later
  const grants = [
    { id: '1', title: 'Research on Lisk L2 Performance', status: 'Active', amount: '5,000,000 IDRX' },
    { id: '2', title: 'Developing Efficient AI Algorithms', status: 'Pending Review', amount: '10,000,000 IDRX' },
    { id: '3', title: 'Blockchain for Supply Chain Transparency', status: 'Completed', amount: '7,500,000 IDRX' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">Research Grants</h1>
        <Link href="/apply">
          <Button>Apply for New Grant</Button> {/* Use Primary Blue Button */}
        </Link>
      </div>
      <p className="text-gray-600">
        Browse available and past research grants within the department.
      </p>

      {/* Placeholder Grant List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {grants.map((grant) => (
          <Card key={grant.id}>
            <CardHeader>
              <CardTitle className="text-lg">{grant.title}</CardTitle>
              <CardDescription>Status: {grant.status}</CardDescription> {/* Use Badge component later */}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">Amount: {grant.amount}</p>
              <Link href={`/grants/${grant.id}`}>
                 <Button variant="outline" size="sm">View Details</Button> {/* Use Secondary Button */}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
       {/* Add pagination controls here later */}
    </div>
  );
}
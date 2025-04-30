// src/app/(main)/talent-pool/page.tsx
'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter } from 'lucide-react';

// Placeholder data structure for talent profiles
interface TalentProfile {
  id: string;
  name: string;
  role: 'Student' | 'Lecturer'; // Example roles
  avatarUrl?: string; // Optional image URL
  skills: string[];
  interests: string[];
  availability: 'Available' | 'Partially Available' | 'Unavailable';
  // Add wallet address later if needed for linking
}

// Placeholder data - replace with actual data fetching later
const talentPoolData: TalentProfile[] = [
  { id: 't1', name: 'Citra Dewi', role: 'Student', skills: ['Python', 'Machine Learning', 'Data Analysis'], interests: ['AI Ethics', 'NLP'], availability: 'Available', avatarUrl: 'https://placehold.co/40x40/EBF4FF/1E3A8A?text=CD' },
  { id: 't2', name: 'Prof. Adi Nugroho', role: 'Lecturer', skills: ['Blockchain', 'Smart Contracts', 'Cryptography', 'Lisk SDK'], interests: ['Layer 2 Scaling', 'Decentralized Finance'], availability: 'Partially Available', avatarUrl: 'https://placehold.co/40x40/EBF4FF/1E3A8A?text=AN' },
  { id: 't3', name: 'Bayu Putra', role: 'Student', skills: ['React', 'Next.js', 'Tailwind CSS', 'Web3 Integration'], interests: ['Frontend Development', 'UX/UI Design'], availability: 'Available', avatarUrl: 'https://placehold.co/40x40/EBF4FF/1E3A8A?text=BP' },
  { id: 't4', name: 'Dr. Rini Wulandari', role: 'Lecturer', skills: ['Signal Processing', 'Embedded Systems', 'IoT'], interests: ['Wireless Communication', 'Sensor Networks'], availability: 'Unavailable', avatarUrl: 'https://placehold.co/40x40/EBF4FF/1E3A8A?text=RW' },
];

export default function TalentPoolPage() {
  // State for search and filters (implement later)
  // const [searchTerm, setSearchTerm] = useState('');
  // const [filters, setFilters] = useState({});

  // Function to determine badge variant based on availability
  const getAvailabilityVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
      switch (status.toLowerCase()) {
          case 'available': return 'default';
          case 'partially available': return 'secondary';
          case 'unavailable': return 'destructive'; // Use secondary or destructive
          default: return 'outline';
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Talent Pool</h1>
          <p className="text-gray-600 mt-1">
            Discover students and lecturers available for research projects and collaboration.
          </p>
        </div>
         {/* Add button to edit own profile later */}
         {/* <Button variant="outline">Edit My Profile</Button> */}
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by name, skill, or interest..."
            className="pl-10 w-full"
            // value={searchTerm}
            // onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex-shrink-0">
           <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
         {/* Implement filter dropdown/modal later */}
      </div>

      {/* Talent Profile List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {talentPoolData.map((profile) => (
          <Card key={profile.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center space-x-4 pb-3 bg-gray-50/50 border-b">
              <Avatar>
                {/* Provide a fallback with initials */}
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                <AvatarFallback className="bg-primary-blue text-white">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{profile.name}</CardTitle>
                <CardDescription>{profile.role}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
               <div>
                 <h4 className="font-medium mb-1 text-gray-700">Skills:</h4>
                 <div className="flex flex-wrap gap-1">
                    {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                 </div>
               </div>
                <div>
                 <h4 className="font-medium mb-1 text-gray-700">Interests:</h4>
                 <div className="flex flex-wrap gap-1">
                    {profile.interests.map((interest, index) => (
                        <Badge key={index} variant="outline">{interest}</Badge>
                    ))}
                 </div>
               </div>
                 <div>
                 <h4 className="font-medium mb-1 text-gray-700">Availability:</h4>
                 <Badge variant={getAvailabilityVariant(profile.availability)}>{profile.availability}</Badge>
               </div>
                {/* Add a "View Profile" button/link later */}
                {/* <Button variant="link" size="sm" className="p-0 h-auto">View Full Profile</Button> */}
            </CardContent>
          </Card>
        ))}
      </div>
       {/* Add pagination controls here later if the list grows */}
    </div>
  );
}

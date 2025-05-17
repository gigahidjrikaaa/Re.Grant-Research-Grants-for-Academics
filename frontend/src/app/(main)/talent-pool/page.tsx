// src/app/(main)/talent-pool/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Loader2 } from 'lucide-react';

interface BackendProfileData {
  id: number; // User ID
  full_name: string | null;
  role: string; // Backend UserRole enum as string e.g., "student", "researcher"
  // is_active: boolean; // Available from backend if needed
  // wallet_address: string | null; // Available from backend if needed
  profile: {
    avatar_url: string | null;
    skills: string[] | null;
    research_interests: string[] | null;
    current_role: string | null; // Profile's specific role like "PhD Candidate"
    headline: string | null;
    // is_visible_in_talent_pool: boolean; // This is used for filtering on backend
    // Add other fields from schemas.profile.ProfileSchema if needed by the UI
  } | null;
  // created_at: string; // Available from backend if needed
}

// Frontend-specific display interface
interface TalentProfile {
  id: string; // User ID as string
  name: string;
  userRoleDisplay: string; // Mapped from backend user.role (e.g., "Student", "Lecturer")
  profileCurrentRole?: string; // From user.profile.current_role
  avatarUrl?: string;
  skills: string[];
  researchInterests: string[]; // Renamed from 'interests' for clarity
  headline?: string;
  // availability: 'Available' | 'Partially Available' | 'Unavailable'; // Placeholder for now
}

export default function TalentPoolPage() {
  const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [searchTerm, setSearchTerm] = useState('');
  // const [filters, setFilters] = useState({});

  // Mapping function from backend data to frontend display structure
  const mapBackendToTalentProfile = (data: BackendProfileData): TalentProfile => {
    let userRoleDisplay: string;
    switch (data.role?.toLowerCase()) {
      case 'student':
        userRoleDisplay = 'Student';
        break;
      case 'researcher':
        userRoleDisplay = 'Researcher/Lecturer'; // Or 'Lecturer' if preferred
        break;
      case 'institution':
        userRoleDisplay = 'Institution Staff';
        break;
      case 'admin':
        userRoleDisplay = 'Administrator';
        break;
      default:
        userRoleDisplay = data.role || 'N/A';
    }

    return {
      id: data.id.toString(),
      name: data.full_name || 'Unnamed User',
      userRoleDisplay: userRoleDisplay,
      profileCurrentRole: data.profile?.current_role || undefined,
      avatarUrl: data.profile?.avatar_url || undefined,
      skills: data.profile?.skills || [],
      researchInterests: data.profile?.research_interests || [],
      headline: data.profile?.headline || undefined,
      // availability: 'Available', // Placeholder - remove if not used or handle differently
    };
  };

  useEffect(() => {
    const fetchTalentPool = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching talent pool...");
        console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
        console.log("Fetching from:", `${process.env.NEXT_PUBLIC_API_URL}/profiles/talent-pool/`);

        // Adjust the URL to your backend API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/talent-pool`);
        if (!response.ok) {
          throw new Error(`Failed to fetch talent pool: ${response.statusText}`);
        }
        const data: BackendProfileData[] = await response.json();
        setTalentProfiles(data.map(mapBackendToTalentProfile));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Error fetching talent pool:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalentPool();
  }, []);

  // Function to determine badge variant based on availability (keep if 'availability' is used)
  // const getAvailabilityVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
  //     if (!status) return 'outline';
  //     switch (status.toLowerCase()) {
  //         case 'available': return 'default';
  //         case 'partially available': return 'secondary';
  //         case 'unavailable': return 'destructive';
  //         default: return 'outline';
  //     }
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
        <p className="ml-2 text-gray-600">Loading talent pool...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  if (talentProfiles.length === 0) {
    return (
        <div className="text-center py-10">
            <p className="text-gray-600">No talent profiles found.</p>
            {/* You might want to add a link to encourage profile completion or visibility settings */}
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Talent Pool</h1>
          <p className="text-gray-600 mt-1">
            Discover students and researchers available for projects and collaboration.
          </p>
        </div>
      </div>

      {/* Search and Filter Section - Keep your existing structure */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by name, skill, or interest..."
            className="pl-10 w-full"
          />
        </div>
        <Button variant="outline" className="flex-shrink-0">
           <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Talent Profile List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {talentProfiles.map((profile) => (
          <Card key={profile.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center space-x-4 pb-3 bg-gray-50/50 border-b">
              <Avatar>
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                <AvatarFallback className="bg-primary-blue text-white">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{profile.name}</CardTitle>
                {/* Display userRoleDisplay and optionally profileCurrentRole */}
                <CardDescription>
                    {profile.userRoleDisplay}
                    {profile.profileCurrentRole && ` - ${profile.profileCurrentRole}`}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm">
               {profile.headline && (
                <p className="text-gray-600 italic">&quot;{profile.headline}&quot;</p>
               )}
               <div>
                 <h4 className="font-medium mb-1 text-gray-700">Skills:</h4>
                 <div className="flex flex-wrap gap-1">
                    {profile.skills.length > 0 ? profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                    )) : <span className="text-xs text-gray-500">No skills listed.</span>}
                 </div>
               </div>
                <div>
                 <h4 className="font-medium mb-1 text-gray-700">Research Interests:</h4>
                 <div className="flex flex-wrap gap-1">
                    {profile.researchInterests.length > 0 ? profile.researchInterests.map((interest, index) => (
                        <Badge key={index} variant="outline">{interest}</Badge>
                    )) : <span className="text-xs text-gray-500">No interests listed.</span>}
                 </div>
               </div>
                 {/* Availability section - remove or adapt if 'availability' field is not used from backend
                 <div>
                 <h4 className="font-medium mb-1 text-gray-700">Availability:</h4>
                 <Badge variant={getAvailabilityVariant(profile.availability)}>{profile.availability}</Badge>
               </div>
                */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
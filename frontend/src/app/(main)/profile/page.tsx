'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  User, Edit, Save, XCircle, Eye, EyeOff, Loader2, AlertTriangle
} from 'lucide-react';
import { toast } from "sonner";
import { shortenAddress } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
// For more complex forms, consider react-hook-form:
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';

// --- Backend Data Structures (align with your Pydantic schemas) ---
interface BackendExperienceSchema {
  id: number;
  title: string | null;
  institution: string | null; // Was company in some schemas, ensure consistency
  location: string | null;
  start_date: string | null; // ISO date
  end_date: string | null; // ISO date
  description: string | null;
}

interface BackendEducationSchema {
  id: number;
  institution: string; // Was institution_name in some schemas
  degree: string;
  major: string | null; // Was field_of_study in some schemas
  graduation_date: string | null; // ISO date
  description: string | null;
}

interface BackendPublicationSchema {
  id: number;
  title: string;
  authors: string[] | null;
  venue: string | null;
  year: number | null;
  link: string | null; // HttpUrl
  abstract: string | null;
}

interface BackendProfileSchema { // Based on schemas.ProfileSchema
  id: number;
  user_id: number;
  avatar_url: string | null;
  current_role: string | null;
  headline: string | null;
  about: string | null; // Maps to 'bio' if that's the schema field
  skills: string[] | null;
  research_interests: string[] | null;
  website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  orcid_id: string | null;
  is_visible_in_talent_pool: boolean;
  experiences: BackendExperienceSchema[];
  educations: BackendEducationSchema[]; // Maps to 'education_entries' if that's the schema field
  publications: BackendPublicationSchema[];
}

interface BackendUserData { // Based on schemas.User
  id: number;
  email: string | null;
  full_name: string | null;
  role: string; // UserRole enum as string
  is_active: boolean;
  is_superuser: boolean;
  wallet_address: string | null;
  created_at: string; // ISO datetime
  updated_at: string | null; // ISO datetime
  profile: BackendProfileSchema | null;
}

// --- Frontend Display Structure ---
interface DisplayProfileData {
  userId: string;
  profileId?: string;
  avatarUrl?: string;
  fullName: string;
  profileCurrentRole?: string;
  userRoleDisplay: string;
  headline?: string;
  walletAddress: string;
  email?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  orcidId?: string;
  about?: string;
  skills: string[];
  researchInterests: string[];
  isVisibleInTalentPool: boolean;
  experience: Array<{ id: string, title: string, institution: string, startDate?: string, endDate?: string, description?: string }>;
  education: Array<{ id: string, degree: string, institution: string, major?: string, gradDate?: string, description?: string }>;
  publications: Array<{ id: string, title: string, authors: string[], venue?: string, year?: number, link?: string, abstract?: string }>;
}

// --- Helper Functions ---
const mapUserRoleToDisplay = (role: string): string => {
  switch (role?.toLowerCase()) {
    case 'student': return 'Student';
    case 'researcher': return 'Researcher';
    case 'admin': return 'Administrator';
    case 'institution': return 'Institution Staff';
    default: return role || 'N/A';
  }
};

const formatDate = (dateString?: string | null): string | undefined => {
    if (!dateString) return undefined;
    try {
        // Assuming dateString is 'YYYY-MM-DD' or full ISO
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        console.error("Date parsing error:", e);
        return dateString;
    }
};

export default function UserProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { address: connectedWalletAddress, isConnected } = useAccount();
  const { token: authToken, isLoading: isAuthLoading } = useAuth(); // Get token from AuthContext
  
  const [profileData, setProfileData] = useState<DisplayProfileData | null>(null);
  const [initialProfileData, setInitialProfileData] = useState<DisplayProfileData | null>(null);
  const [originalBackendUser, setOriginalBackendUser] = useState<BackendUserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapBackendToDisplayData = useCallback((backendUser: BackendUserData): DisplayProfileData => {
    const p = backendUser.profile;
    return {
      userId: backendUser.id.toString(),
      profileId: p?.id.toString(),
      avatarUrl: p?.avatar_url || undefined,
      fullName: backendUser.full_name || 'Unnamed User',
      profileCurrentRole: p?.current_role || undefined,
      userRoleDisplay: mapUserRoleToDisplay(backendUser.role),
      headline: p?.headline || undefined,
      walletAddress: backendUser.wallet_address || 'N/A',
      email: backendUser.email || undefined,
      linkedInUrl: p?.linkedin_url || undefined,
      githubUrl: p?.github_url || undefined,
      websiteUrl: p?.website || undefined,
      orcidId: p?.orcid_id || undefined,
      about: p?.about || undefined,
      skills: p?.skills || [],
      researchInterests: p?.research_interests || [],
      isVisibleInTalentPool: p?.is_visible_in_talent_pool || false,
      experience: p?.experiences?.map(exp => ({
        id: exp.id.toString(),
        title: exp.title || '',
        institution: exp.institution || '',
        startDate: formatDate(exp.start_date),
        endDate: formatDate(exp.end_date),
        description: exp.description || undefined,
      })) || [],
      education: p?.educations?.map(edu => ({
        id: edu.id.toString(),
        degree: edu.degree || '',
        institution: edu.institution || '',
        major: edu.major || undefined,
        gradDate: formatDate(edu.graduation_date),
        description: edu.description || undefined,
      })) || [],
      publications: p?.publications?.map(pub => ({
        id: pub.id.toString(),
        title: pub.title || '',
        authors: pub.authors || [],
        venue: pub.venue || undefined,
        year: pub.year || undefined,
        link: pub.link || undefined,
        abstract: pub.abstract || undefined,
      })) || [],
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isConnected) {
        setError("Please connect your wallet to view your profile.");
        setIsLoading(false);
        setProfileData(null);
        return;
      }
      // Use the token from AuthContext
      if (!authToken && !isAuthLoading) { // Wait if auth is still loading, then check token
        setError("Not authenticated. Please sign in to view your profile.");
        setIsLoading(false);
        setProfileData(null);
        return;
      }
      
      // If auth is loading, you might want to wait or show a specific loading state
      if (isAuthLoading) {
        setIsLoading(true); // Keep outer loading true
        return; // Or set a specific message like "Authenticating..."
      }
      
      // At this point, if isAuthLoading is false and authToken is still null, then authentication failed or didn't happen.
      // The check above handles this. If authToken is present, proceed.

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { // UNCOMMENT and USE this
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json', // Optional, but good practice
          }
        });
        if (!response.ok) {
          if (response.status === 401) throw new Error("Unauthorized. Please log in again.");
          if (response.status === 404) throw new Error("Profile not found. You might need to create one.");
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to fetch profile data.");
        }
        const backendUser: BackendUserData = await response.json();
        setOriginalBackendUser(backendUser); // Store the original backend user data
        const displayData = mapBackendToDisplayData(backendUser);
        setProfileData(displayData);
        setInitialProfileData(displayData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };
    // Trigger fetchProfile when isConnected changes, or when authToken becomes available after auth loading finishes
    if (isConnected) {
        fetchProfile();
    } else {
        // Handle case where user disconnects wallet while on the page
        setError("Please connect your wallet to view your profile.");
        setIsLoading(false);
        setProfileData(null);
    }
  }, [isConnected, authToken, isAuthLoading, mapBackendToDisplayData]);

  const handleToggleTalentPoolVisibility = async (isVisible: boolean) => {
    if (!profileData || !authToken) return;
    
    const originalVisibility = profileData.isVisibleInTalentPool;
    setProfileData(prev => prev ? { ...prev, isVisibleInTalentPool: isVisible } : null);

    try {
      // IMPORTANT: Add Authorization header
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/me`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` // ADD authToken here
        },
        // Send only the field to be updated, matching ProfileUpdate schema
        body: JSON.stringify({ is_visible_in_talent_pool: isVisible }), 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to update visibility on server.");
      }
      toast.success(`Profile is now ${isVisible ? 'visible' : 'hidden'} in Talent Pool.`);
      setInitialProfileData(prev => prev ? { ...prev, isVisibleInTalentPool: isVisible } : null);
    } catch (error) {
      toast.error((error instanceof Error ? error.message : "Failed to update visibility."));
      setProfileData(prev => prev ? { ...prev, isVisibleInTalentPool: originalVisibility } : null);
    }
  };

  const handleSaveChanges = async () => {
    if (!profileData || !authToken) return; // Check for authToken

    // Map frontend DisplayProfileData back to backend schemas.ProfileUpdate
    // Ensure field names match your Pydantic ProfileUpdate schema
    const updatePayload: Partial<Omit<BackendProfileSchema, 'id' | 'user_id' | 'experiences' | 'educations' | 'publications'>> = {
        headline: profileData.headline,
        about: profileData.about,
        skills: profileData.skills,
        research_interests: profileData.researchInterests,
        website: profileData.websiteUrl,
        linkedin_url: profileData.linkedInUrl,
        github_url: profileData.githubUrl,
        orcid_id: profileData.orcidId,
        avatar_url: profileData.avatarUrl,
        current_role: profileData.profileCurrentRole,
        // is_visible_in_talent_pool is handled by its own function or can be included here
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cleanedPayload = Object.fromEntries(Object.entries(updatePayload).filter(([_, v]) => v !== undefined));

    toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` // ADD authToken here
        },
        body: JSON.stringify(cleanedPayload),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to update profile.");
        }
        // The backend should return the updated profile schema upon successful PUT
        return response.json() as Promise<BackendProfileSchema>; 
      }),
      {
        loading: 'Saving profile...',
        success: (updatedProfileSchema: BackendProfileSchema) => {
          if (!originalBackendUser) {
            toast.error("Critical error: Original user data not found. Please refresh.");
            setIsEditing(false);
            return "Failed to update: Missing essential data.";
          }

          const newBackendUserData: BackendUserData = {
            ...originalBackendUser,
            profile: updatedProfileSchema,
            // If the User model's updated_at changes and is part of updatedProfileSchema or a separate field, handle it here.
            // Assuming updated_at on User might be implicitly updated on the backend.
          };
          
          setOriginalBackendUser(newBackendUserData); // Update the stored full backend user data

          const updatedDisplayData = mapBackendToDisplayData(newBackendUserData);
          setProfileData(updatedDisplayData);
          setInitialProfileData(updatedDisplayData);
          setIsEditing(false);
          return "Profile updated successfully!";
        },
        error: (err) => `Error: ${err.message}`,
      }
    );
  };
  
  const handleCancelEdit = () => {
    setProfileData(initialProfileData);
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="flex flex-col justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary-blue" /><p className="mt-4">Loading profile...</p></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 min-h-screen">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold mb-2 text-destructive">Profile Error</h1>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  if (!isConnected || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 min-h-screen">
        <User className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Profile Not Available</h1>
        <p className="text-muted-foreground mb-6">Please connect your wallet to view or create your profile.</p>
        {/* Consider adding CustomConnectWalletButton here */}
      </div>
    );
  }

  const renderEditableField = (label: string, fieldName: keyof DisplayProfileData, placeholder?: string, component: 'input' | 'textarea' = 'input') => {
    if (!profileData) return null;
    const value = profileData[fieldName] as string || '';
    if (isEditing) {
      const commonProps = {
        id: fieldName,
        placeholder: placeholder || `Enter ${label.toLowerCase()}`,
        defaultValue: value,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProfileData(prev => prev ? { ...prev, [fieldName]: e.target.value } : null),
        className: "text-foreground bg-background" // Ensure inputs are styled for current theme
      };
      return (
        <div className="space-y-1">
          <Label htmlFor={fieldName} className="text-muted-foreground">{label}</Label>
          {component === 'textarea' ? <Textarea {...commonProps} rows={fieldName === 'about' ? 5 : 3} /> : <Input type="text" {...commonProps} />}
        </div>
      );
    }
    return (
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
        <p className={value ? "text-foreground" : "text-muted-foreground italic"}>{value || 'Not set'}</p>
      </div>
    );
  };

  const renderEditableTagsField = (label: string, fieldName: 'skills' | 'researchInterests', placeholder?: string) => {
    if (!profileData) return null;
    const items = profileData[fieldName] || [];
    if (isEditing) {
      return (
        <div className="space-y-1">
          <Label htmlFor={fieldName} className="text-muted-foreground">{label}</Label>
          <Input
            id={fieldName}
            placeholder={placeholder || "Enter items, comma-separated"}
            defaultValue={items.join(', ')}
            onChange={(e) => {
              const newItems = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              setProfileData(prev => prev ? { ...prev, [fieldName]: newItems } : null);
            }}
            className="text-foreground bg-background"
          />
           <div className="flex flex-wrap gap-2 mt-2">
            {items.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
          </div>
        </div>
      );
    }
    return (
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-1">
            {items.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
          </div>
        ) : <p className="text-muted-foreground italic">Not set</p>}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-2 ring-offset-2 ring-primary-blue">
              <AvatarImage src={profileData.avatarUrl} alt={profileData.fullName} />
              <AvatarFallback className="text-3xl bg-primary-blue text-primary-foreground">
                {profileData.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profileData.fullName}</h1>
              <p className="text-md text-primary-blue">{profileData.profileCurrentRole || profileData.userRoleDisplay}</p>
              {isEditing ? renderEditableField('Headline', 'headline', 'Your professional headline') : 
                <p className="text-sm text-muted-foreground mt-1">{profileData.headline || 'No headline set.'}</p>
              }
              <p className="text-xs text-muted-foreground mt-2">Wallet: {shortenAddress(profileData.walletAddress)}</p>
            </div>
            <div className="flex flex-col items-center sm:items-end space-y-2 sm:ml-auto shrink-0">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleCancelEdit}><XCircle className="mr-2 h-4 w-4" /> Cancel</Button>
                  <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                </div>
              )}
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="talent-pool-visibility"
                  checked={profileData.isVisibleInTalentPool}
                  onCheckedChange={handleToggleTalentPoolVisibility}
                  disabled={isEditing}
                />
                <Label htmlFor="talent-pool-visibility" className="text-sm text-muted-foreground whitespace-nowrap">
                  Visible in Talent Pool
                </Label>
                {profileData.isVisibleInTalentPool ? <Eye className="h-4 w-4 text-green-500"/> : <EyeOff className="h-4 w-4 text-muted-foreground"/>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert">
              {isEditing ? renderEditableField('About Me', 'about', 'Tell us about yourself...', 'textarea') :
                <p className={profileData.about ? "text-foreground" : "italic text-muted-foreground"}>{profileData.about || 'No summary provided.'}</p>}
            </CardContent>
          </Card>

          <Card>
              <CardHeader><CardTitle>Publications</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                  {profileData.publications.length > 0 ? profileData.publications.map(pub => (
                      <div key={pub.id} className="text-sm">
                          <a href={pub.link || '#'} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-blue hover:underline">{pub.title}</a>
                          <p className="text-xs text-muted-foreground">{pub.authors?.join(', ')} - {pub.venue} ({pub.year})</p>
                      </div>
                  )) : <p className="text-sm text-muted-foreground italic">No publications listed.</p>}
                  {isEditing && <Button variant="outline" size="sm" className="mt-2">Add Publication</Button> /* TODO: Implement add/edit for array items */}
              </CardContent>
          </Card>
          
          <Card>
              <CardHeader><CardTitle>Education</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                  {profileData.education.length > 0 ? profileData.education.map(edu => (
                       <div key={edu.id} className="text-sm">
                          <p className="font-semibold text-foreground">{edu.degree} - {edu.major}</p>
                          <p className="text-muted-foreground">{edu.institution}</p>
                          <p className="text-xs text-muted-foreground">Graduated: {edu.gradDate}</p>
                      </div>
                  )) : <p className="text-sm text-muted-foreground italic">No education listed.</p>}
                  {isEditing && <Button variant="outline" size="sm" className="mt-2">Add Education</Button>}
              </CardContent>
          </Card>

          <Card>
              <CardHeader><CardTitle>Experience</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                   {profileData.experience.length > 0 ? profileData.experience.map(exp => (
                       <div key={exp.id} className="text-sm">
                          <p className="font-semibold text-foreground">{exp.title} at {exp.institution}</p>
                          <p className="text-xs text-muted-foreground">{exp.startDate} - {exp.endDate || 'Present'}</p>
                          {exp.description && <p className="text-muted-foreground mt-1 text-xs">{exp.description}</p>}
                      </div>
                  )) : <p className="text-sm text-muted-foreground italic">No experience listed.</p>}
                  {isEditing && <Button variant="outline" size="sm" className="mt-2">Add Experience</Button>}
              </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Contact & Links</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {renderEditableField('Email', 'email', 'your.email@example.com')}
              {renderEditableField('LinkedIn', 'linkedInUrl', 'https://linkedin.com/in/...')}
              {renderEditableField('GitHub', 'githubUrl', 'https://github.com/...')}
              {renderEditableField('Website', 'websiteUrl', 'https://your.site')}
              {profileData.userRoleDisplay === 'Researcher' && renderEditableField('ORCID ID', 'orcidId', '0000-0000-0000-0000')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent>
              {renderEditableTagsField('Skills', 'skills', 'e.g., Python, Data Analysis')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Research Interests</CardTitle></CardHeader>
            <CardContent>
              {renderEditableTagsField('Research Interests', 'researchInterests', 'e.g., DeFi, L2 Scaling')}
            </CardContent>
          </Card>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3 mt-8">
          <Button variant="outline" onClick={handleCancelEdit}><XCircle className="mr-2 h-4 w-4" /> Cancel</Button>
          <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>
      )}
    </div>
  );
}
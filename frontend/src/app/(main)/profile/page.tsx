// frontend/src/app/(main)/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User, Edit, Save, XCircle, Linkedin, Github, Globe, Link as LinkIcon, BookOpen, Award, Briefcase, GraduationCap, Lightbulb, Eye, EyeOff
} from 'lucide-react';
import Link from 'next/link'; // For external links if needed
import { toast } from "sonner";
import { shortenAddress } from '@/lib/utils';
// import { useForm, useFieldArray, Controller } from 'react-hook-form'; // For editing
// import { zodResolver } from '@hookform/resolvers/zod'; // For editing
// import * as z from 'zod'; // For editing

// Placeholder types - these would ideally be more robust and possibly shared
interface ProfileData {
  id: string;
  avatarUrl?: string;
  fullName: string;
  currentRole: string;
  headline: string;
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
  // More complex fields for edit mode:
  experience: Array<{ id: string, title: string, institution: string, dates: string, description?: string }>;
  education: Array<{ id: string, degree: string, institution: string, major: string, gradDate: string }>;
  publications: Array<{ id: string, title: string, authors: string, venue: string, year: string, link?: string }>;
}

// Example: Determine user role (replace with actual authentication logic)
const useUserRole = (): 'student' | 'researcher' | 'admin' => {
  return 'researcher'; // Default for example
};

export default function UserProfilePage() {
  const { address, isConnected } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = useUserRole(); // Get user role

  // TODO: Form handling setup using react-hook-form and Zod for edit mode
  // const form = useForm<ProfileData>(...);

  useEffect(() => {
    // TODO: Fetch profile data for the connected user
    if (isConnected && address) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setProfileData({
          id: 'user123',
          fullName: 'Dr. Ada Lovelace',
          currentRole: userRole === 'researcher' ? 'Lead Blockchain Researcher' : 'Computer Science Student',
          headline: userRole === 'researcher' ? 'Pioneering decentralized grant systems & exploring Lisk L2 capabilities.' : 'Eager to contribute to innovative blockchain projects.',
          walletAddress: address,
          avatarUrl: 'https://via.placeholder.com/128/EBF4FF/1E3A8A?text=AL', // Placeholder
          email: 'ada.lovelace@example.com',
          linkedInUrl: 'https://linkedin.com/in/adalovelace',
          githubUrl: 'https://github.com/adalovelace',
          orcidId: '0000-0002-1825-0097',
          about: userRole === 'researcher' ? 'With a strong background in cryptography and distributed systems, my work focuses on enhancing the transparency and efficiency of academic funding through blockchain technology. I am particularly interested in the application of zero-knowledge proofs and novel consensus mechanisms on L2 solutions like Lisk.' : 'A final year Information Engineering student passionate about blockchain technology and its potential to revolutionize various sectors. Proficient in Solidity and JavaScript, with experience in developing dApps. Actively seeking research assistant roles or project collaborations.',
          skills: ['Blockchain', 'Lisk SDK', 'Solidity', 'Smart Contracts', 'Cryptography', 'Python', 'Data Analysis'],
          researchInterests: ['Decentralized Finance (DeFi)', 'Layer 2 Scaling', 'AI Ethics in Blockchain', 'Tokenomics'],
          isVisibleInTalentPool: true,
          experience: userRole === 'researcher' ? [
            { id: 'exp1', title: 'Senior Researcher', institution: 'Tech Innovation Institute', dates: '2020 - Present', description: 'Leading research on L2 solutions.' },
          ] : [],
          education: [
            { id: 'edu1', degree: userRole === 'researcher' ? 'PhD in Computer Science' : 'B.Eng. in Information Engineering (Expected)', institution: 'University of Excellence', major: 'Decentralized Systems', gradDate: userRole === 'researcher' ? '2019' : '2025' },
          ],
          publications: userRole === 'researcher' ? [
            { id: 'pub1', title: 'Scalable Consensus on L2', authors: 'Lovelace, A.', venue: 'Journal of Blockchain Research', year: '2023', link: '#' },
          ] : [],
        });
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
      setProfileData(null);
    }
  }, [isConnected, address, userRole]);

  const handleToggleTalentPoolVisibility = async (isVisible: boolean) => {
    if (!profileData) return;
    // TODO: API call to update this setting
    console.log("Setting talent pool visibility to:", isVisible);
    toast.promise(
        new Promise(resolve => setTimeout(resolve, 500)).then(() => { // Simulate API call
            setProfileData(prev => prev ? { ...prev, isVisibleInTalentPool: isVisible } : null);
        }),
        {
            loading: 'Updating visibility...',
            success: `Profile is now ${isVisible ? 'visible' : 'hidden'} in Talent Pool.`,
            error: 'Failed to update visibility.',
        }
    );
  };

  const handleSaveChanges = () => {
    // TODO: Implement form submission logic using react-hook-form
    // form.handleSubmit(onSubmit)();
    console.log("Saving profile data:", profileData); // Placeholder
    toast.success("Profile Updated Successfully!");
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Loading profile...</p></div>;
  }

  if (!isConnected || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
        <User className="w-16 h-16 text-text-muted mb-4" />
        <h1 className="text-2xl font-semibold mb-2 text-text-primary">Profile Not Available</h1>
        <p className="text-text-secondary mb-6">Please connect your wallet to view or create your profile.</p>
        {/* Consider adding CustomConnectWalletButton here if appropriate */}
      </div>
    );
  }

  // Helper to render editable fields (simplified)
  const renderEditableField = (label: string, fieldName: keyof ProfileData, placeholder?: string, component: 'input' | 'textarea' = 'input') => {
    if (!profileData) return null;
    // In a real form, you'd use Controller from react-hook-form for controlled components
    const value = profileData[fieldName] as string || '';
    if (isEditing) {
      if (component === 'textarea') {
        return (
          <div className="space-y-1">
            <Label htmlFor={fieldName}>{label}</Label>
            <Textarea
              id={fieldName}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              defaultValue={value} // Or use controlled component with react-hook-form
              onChange={(e) => setProfileData(prev => prev ? { ...prev, [fieldName]: e.target.value } : null)}
              rows={fieldName === 'about' ? 5 : 3}
            />
          </div>
        );
      }
      return (
        <div className="space-y-1">
          <Label htmlFor={fieldName}>{label}</Label>
          <Input
            id={fieldName}
            type="text"
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            defaultValue={value} // Or use controlled component with react-hook-form
            onChange={(e) => setProfileData(prev => prev ? { ...prev, [fieldName]: e.target.value } : null)}
          />
        </div>
      );
    }
    return (
      <div>
        <h4 className="text-sm font-medium text-text-muted">{label}</h4>
        <p className={value ? "text-text-primary" : "text-text-muted italic"}>{value || 'Not set'}</p>
      </div>
    );
  };

  // For array fields like skills (simplified display/edit)
  const renderEditableTagsField = (label: string, fieldName: 'skills' | 'researchInterests', placeholder?: string) => {
    if (!profileData) return null;
    const items = profileData[fieldName] || [];
    if (isEditing) {
      return (
        <div className="space-y-1">
          <Label htmlFor={fieldName}>{label}</Label>
          <Input
            id={fieldName}
            placeholder={placeholder || "Enter items, comma-separated"}
            defaultValue={items.join(', ')}
            onChange={(e) => {
              const newItems = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              setProfileData(prev => prev ? { ...prev, [fieldName]: newItems } : null);
            }}
          />
           <div className="flex flex-wrap gap-2 mt-2">
            {items.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
          </div>
        </div>
      );
    }
    return (
      <div>
        <h4 className="text-sm font-medium text-text-muted">{label}</h4>
        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-1">
            {items.map((item, index) => <Badge key={index} variant="secondary">{item}</Badge>)}
          </div>
        ) : <p className="text-text-muted italic">Not set</p>}
      </div>
    );
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8">
      {/* Profile Header & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-2 ring-offset-2 ring-primary-blue">
              <AvatarImage src={profileData.avatarUrl} alt={profileData.fullName} />
              <AvatarFallback className="text-3xl bg-primary-blue text-primary-foreground">
                {profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{profileData.fullName}</h1>
              <p className="text-md text-primary-blue">{profileData.currentRole}</p>
              <p className="text-sm text-text-secondary mt-1">{profileData.headline}</p>
              <p className="text-xs text-text-muted mt-2">Wallet: {shortenAddress(profileData.walletAddress)}</p>
            </div>
            <div className="flex flex-col items-center sm:items-end space-y-2 sm:ml-auto shrink-0">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    // TODO: Reset form to original profileData if using react-hook-form
                  }}><XCircle className="mr-2 h-4 w-4" /> Cancel</Button>
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
                <Label htmlFor="talent-pool-visibility" className="text-sm text-text-secondary whitespace-nowrap">
                  Visible in Talent Pool
                </Label>
                {profileData.isVisibleInTalentPool ? <Eye className="h-4 w-4 text-green-500"/> : <EyeOff className="h-4 w-4 text-text-muted"/>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Profile Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-text-secondary dark:prose-invert">
              {isEditing ? renderEditableField('About Me', 'about', 'Tell us about yourself...', 'textarea') :
                <p className={profileData.about ? "" : "italic text-text-muted"}>{profileData.about || (isEditing ? '' : 'No summary provided.')}</p>}
            </CardContent>
          </Card>

          {userRole === 'researcher' && profileData.publications.length > 0 && (
            <Card>
                <CardHeader><CardTitle>Recent Publications</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {profileData.publications.map(pub => (
                        <div key={pub.id} className="text-sm">
                            <a href={pub.link || '#'} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-blue hover:underline">{pub.title}</a>
                            <p className="text-xs text-text-muted">{pub.authors} - {pub.venue} ({pub.year})</p>
                        </div>
                    ))}
                    {isEditing && <Button variant="outline" size="sm" className="mt-2">Add Publication</Button>}
                </CardContent>
            </Card>
          )}

            <Card>
                <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {profileData.education.map(edu => (
                         <div key={edu.id} className="text-sm">
                            <p className="font-semibold text-text-primary">{edu.degree} - {edu.major}</p>
                            <p className="text-text-secondary">{edu.institution}</p>
                            <p className="text-xs text-text-muted">Graduated: {edu.gradDate}</p>
                        </div>
                    ))}
                    {isEditing && <Button variant="outline" size="sm" className="mt-2">Add Education</Button>}
                </CardContent>
            </Card>

          {userRole === 'researcher' && profileData.experience.length > 0 && (
            <Card>
                <CardHeader><CardTitle>Experience</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                     {profileData.experience.map(exp => (
                         <div key={exp.id} className="text-sm">
                            <p className="font-semibold text-text-primary">{exp.title} at {exp.institution}</p>
                            <p className="text-xs text-text-muted">{exp.dates}</p>
                            {exp.description && <p className="text-text-secondary mt-1 text-xs">{exp.description}</p>}
                        </div>
                    ))}
                    {isEditing && <Button variant="outline" size="sm" className="mt-2">Add Experience</Button>}
                </CardContent>
            </Card>
          )}


        </div>

        {/* Right Column - Skills, Interests, Links */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Contact & Links</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {renderEditableField('Email', 'email', 'your.email@example.com')}
              {renderEditableField('LinkedIn Profile', 'linkedInUrl', 'https://linkedin.com/in/...')}
              {renderEditableField('GitHub Profile', 'githubUrl', 'https://github.com/...')}
              {renderEditableField('Website/Portfolio', 'websiteUrl', 'https://your.site')}
              {userRole === 'researcher' && renderEditableField('ORCID ID', 'orcidId', '0000-0000-0000-0000')}
              <Button variant="outline" size="sm" className="w-full mt-2" disabled> {/* Future feature */}
                <Linkedin className="mr-2 h-4 w-4"/> Import from LinkedIn (Soon)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent>
              {renderEditableTagsField('Skills', 'skills', 'e.g., Python, Data Analysis, Lisk SDK')}
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
          <Button variant="outline" onClick={() => {
            setIsEditing(false);
            // TODO: Reset form to original profileData if using react-hook-form
          }}><XCircle className="mr-2 h-4 w-4" /> Cancel</Button>
          <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>
      )}

    </div>
  );
}
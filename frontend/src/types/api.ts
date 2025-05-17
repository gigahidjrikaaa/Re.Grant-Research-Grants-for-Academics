// frontend/src/types/api.ts

// Corresponds to backend's schemas.UserRole
export enum UserRole {
  ADMIN = "ADMIN",
  RESEARCHER = "RESEARCHER",
  INSTITUTION = "INSTITUTION",
  STUDENT = "STUDENT",
}

// Corresponds to backend's schemas.ProfileSchema
export interface Profile {
  id: number;
  user_id: number;
  headline: string | null;
  bio: string | null;
  skills: string | null; // Assuming comma-separated string or needs parsing
  website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  profile_picture_url: string | null;
  // Add other fields from your ProfileSchema like experiences, education, publications if they are nested here
  // For now, assuming they are fetched separately or on a detailed profile view.
}

// Corresponds to backend's schemas.UserSchema (adjust based on what /users/me or public user listings return)
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  is_superuser: boolean;
  wallet_address: string | null;
  profile: Profile | null; // Profile can be nested
  // created_at, updated_at if present
}

// Corresponds to backend's schemas.GrantType
export enum GrantType {
  RESEARCH = "RESEARCH",
  FELLOWSHIP = "FELLOWSHIP",
  SCHOLARSHIP = "SCHOLARSHIP",
  TRAVEL = "TRAVEL",
  EQUIPMENT = "EQUIPMENT",
  OTHER = "OTHER",
}

// Corresponds to backend's schemas.Grant (or GrantSchema)
export interface Grant {
  id: number;
  title: string;
  description: string;
  proposer_id: number;
  proposer?: User; // Nested funder information, if backend provides it
  total_funding_requested: number | string; // Backend uses Numeric, frontend might receive as string or number
  currency: string;
  application_deadline: string; // ISO date string
  application_start_date?: string | null; // ISO date string
  eligibility_criteria: string | null;
  grant_type: GrantType;
  website_link: string | null;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
  // Any other relevant fields from your backend Grant schema
}

// Corresponds to backend's schemas.ProjectCategory
export enum ProjectCategory {
  TECHNOLOGY = "TECHNOLOGY",
  SCIENCE = "SCIENCE",
  ARTS = "ARTS",
  SOCIAL_IMPACT = "SOCIAL_IMPACT",
  EDUCATION = "EDUCATION",
  HEALTH = "HEALTH",
  ENVIRONMENT = "ENVIRONMENT",
  OTHER = "OTHER",
}

// Corresponds to backend's schemas.ProjectTeamMemberSchema
export interface ProjectTeamMember {
  id: number;
  project_id: number;
  user_id: number;
  role_in_project: string;
  user?: User; // Nested user information for the team member
}

// Corresponds to backend's schemas.Project (or ProjectSchema)
export interface Project {
  id: number;
  title: string;
  description: string;
  category: ProjectCategory;
  status: string; // Consider an Enum if statuses are fixed
  start_date: string | null; // ISO date string
  end_date: string | null; // ISO date string
  budget: number | string | null; // Backend uses Numeric
  required_skills: string | null; // Assuming comma-separated
  created_by_user_id: number;
  creator?: User; // Nested creator information
  team_members?: ProjectTeamMember[]; // Nested team member information
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
  // research_goals, visibility etc.
}

// For paginated responses if your backend uses this structure
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages?: number; // Optional if backend calculates it
}
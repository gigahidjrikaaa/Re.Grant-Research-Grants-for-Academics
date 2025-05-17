// frontend/src/lib/apiService.ts
import { Grant, Project, User } from '@/types/api'; // Adjust path if needed

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface FetchOptions extends RequestInit {
  token?: string | null;
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOpts } = options;
  const headers = new Headers(fetchOpts.headers || {});
  
  if (!headers.has('Content-Type') && !(fetchOpts.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOpts,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
        console.error("Error parsing JSON response:", e);
      // Not a JSON response
      errorData = { detail: response.statusText || 'An unknown error occurred' };
    }
    console.error(`API Error (${response.status}): ${endpoint}`, errorData);
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) { // No Content
    return undefined as T; // Or handle as appropriate for your use case
  }
  return response.json() as Promise<T>;
}

// --- Grant Endpoints ---
interface GetGrantsParams {
  skip?: number;
  limit?: number;
  // Add other filter/sort params your backend supports
}
export const getAllGrants = (params?: GetGrantsParams, token?: string | null): Promise<Grant[]> => { // Assuming backend returns List[Grant] not PaginatedResponse for now
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
  if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));
  
  return fetchApi<Grant[]>(`/grants/?${queryParams.toString()}`, { method: 'GET', token });
};

export const getGrantById = (grantId: number | string, token?: string | null): Promise<Grant> => {
  return fetchApi<Grant>(`/grants/${grantId}`, { method: 'GET', token });
};

// --- Project Endpoints ---
interface GetProjectsParams {
  skip?: number;
  limit?: number;
  // Add other filter/sort params
}
export const getAllProjects = (params?: GetProjectsParams, token?: string | null): Promise<Project[]> => { // Assuming backend returns List[Project]
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
  if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));

  return fetchApi<Project[]>(`/projects/?${queryParams.toString()}`, { method: 'GET', token });
};

export const getProjectById = (projectId: number | string, token?: string | null): Promise<Project> => {
  return fetchApi<Project>(`/projects/${projectId}`, { method: 'GET', token });
};

// --- Talent Pool (User/Profile) Endpoints ---
interface GetUsersParams {
  skip?: number;
  limit?: number;
  // Add other filter/sort params (e.g., search by skills, name)
}
// This will fetch users, and each user object should contain their profile if available.
export const getAllUsersWithProfiles = (params?: GetUsersParams, token?: string | null): Promise<User[]> => { // Assuming User[] where each User has a Profile object
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
  if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));
  // Add query params for filtering (e.g., only users with profiles, specific roles) if backend supports
  // queryParams.append('has_profile', 'true'); // Example
  
  return fetchApi<User[]>(`/users/?${queryParams.toString()}`, { method: 'GET', token });
};

// If you need a dedicated endpoint for a single profile, define it here.
// For now, assuming detailed profile view might come from /users/{user_id} or a profile-specific page.
export const getUserProfileById = (userId: number | string, token?: string | null): Promise<User> => { // Fetches the User, which includes the Profile
  return fetchApi<User>(`/users/${userId}`, { method: 'GET', token });
};

// Add other necessary API functions (e.g., for applications, creating grants/projects if needed outside admin)
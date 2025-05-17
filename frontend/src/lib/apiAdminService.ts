// frontend/src/lib/apiAdminService.ts
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface TableSchemaColumn {
  name: string;
  type: string;
}
export interface TableSchemaResponse {
  name: string;
  columns: TableSchemaColumn[];
  primary_keys: string[];
}

export interface TableDataResponse {
  table_name: string;
  total_rows: number;
  page: number;
  page_size: number;
  data: Record<string, unknown>[]; // Array of row data
}

async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
  token?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      console.error("Error parsing JSON response:", e);
      errorData = { detail: response.statusText || 'An unknown error occurred' };
    }
    console.error(`API Error (${response.status}): ${endpoint}`, errorData);
    toast.error(`API Error: ${errorData.detail || response.statusText}`);
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) { // No Content for DELETE
    return null as T; // Or handle appropriately
  }
  return response.json() as Promise<T>;
}



//? --- Admin Data Editor API Calls ---

export const listManageableTables = (token: string | null): Promise<string[]> => {
  return request<string[]>('/admin-data/tables', 'GET', null, token);
};

export const getTableSchema = (tableName: string, token: string | null): Promise<TableSchemaResponse> => {
  return request<TableSchemaResponse>(`/admin-data/tables/${tableName}/schema`, 'GET', null, token);
};

export const getTableData = (
  tableName: string,
  token: string | null,
  page: number = 1,
  pageSize: number = 10,
  sortBy?: string,
  sortDesc?: boolean
): Promise<TableDataResponse> => {
  let endpoint = `/admin-data/tables/${tableName}/data?page=${page}&page_size=${pageSize}`;
  if (sortBy) {
    endpoint += `&sort_by=${sortBy}&sort_desc=${sortDesc ? 'true' : 'false'}`;
  }
  return request<TableDataResponse>(endpoint, 'GET', null, token);
};

export const createTableRow = (
  tableName: string,
  rowData: Record<string, unknown>,
  token: string | null
): Promise<Record<string, unknown>> => { // Response might include the created row
  return request<Record<string, unknown>>(`/admin-data/tables/${tableName}/data`, 'POST', rowData, token);
};

export const updateTableRow = (
  tableName: string,
  rowId: string | number, // Assuming PK is string or number for now
  rowData: Record<string, unknown>,
  token: string | null
): Promise<Record<string, unknown>> => { // Response might include the updated row
  return request<Record<string, unknown>>(`/admin-data/tables/${tableName}/data/${rowId}`, 'PUT', rowData, token);
};

export const deleteTableRow = (
  tableName: string,
  rowId: string | number,
  token: string | null
): Promise<null> => { // DELETE usually returns 204 No Content
  return request<null>(`/admin-data/tables/${tableName}/data/${rowId}`, 'DELETE', null, token);
};


export interface SeedResponse {
  message: string;
  details?: Record<string, unknown>; // For comprehensive responses like seedAll
  users_created?: number;
  profiles_created?: number;
  publications_created?: number;
  grants_created?: number;
  projects_created?: number;
  applications_created?: number; // Generic for grant/project apps
  // Add other specific count fields if your backend returns them
}

export interface SeedUsersPayload {
  count: number;
}

export interface SeedProfilesPayload {
  user_ids?: number[];
  num_recent_users: number;
}

export interface SeedPublicationsPayload {
  profile_ids?: number[];
  num_recent_profiles: number;
  pubs_per_profile_avg: number;
}

export interface SeedCountPayload { // For Grants, Projects
  count: number;
}

export interface SeedApplicationsPayload {
  target_ids?: number[];
  num_recent_targets: number;
  apps_per_target_avg: number;
  num_applicants: number;
}

export interface SeedAllPayload {
  num_users: number;
  num_grants: number;
  num_projects: number;
  pubs_per_profile_avg: number;
  apps_per_grant_avg: number;
  apps_per_project_avg: number;
}


// --- API Service Functions for Seeding ---

export const seedDummyUsers = (payload: SeedUsersPayload, token: string | null): Promise<SeedResponse> => {
  return request<SeedResponse>('/admin-data/seed/users', 'POST', payload, token);
};

export const seedDummyProfilesWithDetails = (payload: SeedProfilesPayload, token: string | null): Promise<SeedResponse> => {
  return request<SeedResponse>('/admin-data/seed/profiles-with-details', 'POST', payload, token);
};

export const seedDummyPublications = (payload: SeedPublicationsPayload, token: string | null): Promise<SeedResponse> => {
  return request<SeedResponse>('/admin-data/seed/publications', 'POST', payload, token);
};

export const seedDummyGrants = (payload: SeedCountPayload, token: string | null): Promise<SeedResponse> => {
  return request<SeedResponse>('/admin-data/seed/grants', 'POST', payload, token);
};

export const seedDummyProjects = (payload: SeedCountPayload, token: string | null): Promise<SeedResponse> => {
  return request<SeedResponse>('/admin-data/seed/projects', 'POST', payload, token);
};

export const seedDummyGrantApplications = (payload: SeedApplicationsPayload, token: string | null): Promise<SeedResponse> => {
  return request<SeedResponse>('/admin-data/seed/grant-applications', 'POST', payload, token);
};

export const seedDummyProjectApplications = (payload: SeedApplicationsPayload, token: string | null): Promise<SeedResponse> => {
  return request<SeedResponse>('/admin-data/seed/project-applications', 'POST', payload, token);
};

export const seedAllSampleData = (payload: SeedAllPayload, token: string | null): Promise<SeedResponse> => {
  return request<SeedResponse>('/admin-data/seed/all-sample-data', 'POST', payload, token);
};
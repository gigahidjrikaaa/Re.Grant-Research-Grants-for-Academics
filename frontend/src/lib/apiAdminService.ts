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

// --- Admin Data Editor API Calls ---

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
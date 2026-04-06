// === Auth ===
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
  expiresAt: string;
}

export interface AuthUser {
  token: string;
  username: string;
  fullName: string;
  role: 'Operador' | 'Supervisor';
  expiresAt: string;
}

// === DNI ===
export interface DniLookupResponse {
  dni: string;
  firstNames: string;
  paternalSurname: string;
  maternalSurname: string;
  birthDate: string;
  gender: string;
  address: string;
  department: string;
  province: string;
  district: string;
}

// === Registration ===
export interface CreateRegistrationRequest {
  dni: string;
  firstNames: string;
  paternalSurname: string;
  maternalSurname: string;
  birthDate: string;
  gender: string;
  phone?: string;
  email?: string;
  address: string;
  department: string;
  province: string;
  district: string;
  educationLevel: string;
  militaryServiceInterest: boolean;
  weight?: number | '';
  height?: number | '';
  photoPath?: string;
  fingerprintStatus: string;
  registrationMode: string;
  observations?: string;
}

export interface UpdateRegistrationRequest {
  firstNames?: string;
  paternalSurname?: string;
  maternalSurname?: string;
  phone?: string;
  email?: string;
  address: string;
  department: string;
  province: string;
  district: string;
  educationLevel: string;
  militaryServiceInterest: boolean;
  weight?: number | '';
  height?: number | '';
  photoPath?: string;
  fingerprintStatus?: string;
  registrationStatus?: string;
  observations?: string;
}

export interface RegistrationResponse {
  id: number;
  dni: string;
  firstNames: string;
  paternalSurname: string;
  maternalSurname: string;
  birthDate: string;
  gender: string;
  phone?: string;
  email?: string;
  address: string;
  department: string;
  province: string;
  district: string;
  educationLevel: string;
  militaryServiceInterest: boolean;
  weight?: number | '';
  height?: number | '';
  photoPath?: string;
  fingerprintStatus: string;
  registrationMode: string;
  observations?: string;
  registrationStatus: string;
  syncStatus: string;
  syncMessage?: string;
  createdAt: string;
  updatedAt?: string;
  createdByName: string;
  updatedByName?: string;
}

export interface RegistrationListItem {
  id: number;
  dni: string;
  fullName: string;
  department: string;
  registrationStatus: string;
  syncStatus: string;
  militaryServiceInterest: boolean;
  registrationMode: string;
  hasPhoto: boolean;
  fingerprintStatus: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

// === Pagination ===
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RegistrationFilter {
  searchTerm?: string;
  registrationStatus?: string;
  syncStatus?: string;
  department?: string;
  militaryServiceInterest?: boolean;
  registrationMode?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

// === Dashboard ===
export interface DashboardResponse {
  totalRegistrations: number;
  todayRegistrations: number;
  militaryInterestCount: number;
  byStatus: Record<string, number>;
  bySyncStatus: Record<string, number>;
  byDepartment: Record<string, number>;
  byGender: Record<string, number>;
  byMode: Record<string, number>;
  withPhotoCount: number;
  withFingerprintCount: number;
  recentRegistrations: RegistrationListItem[];
}

// === Audit ===
export interface AuditLogResponse {
  id: number;
  entityName: string;
  entityId: number;
  action: string;
  description?: string;
  oldValues?: string;
  newValues?: string;
  userName: string;
  timestamp: string;
}

export interface AuditFilter {
  entityName?: string;
  entityId?: number;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

// === API Error ===
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

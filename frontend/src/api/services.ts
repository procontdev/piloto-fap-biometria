import api from './client';
import type {
  LoginRequest, LoginResponse, DniLookupResponse,
  CreateRegistrationRequest, UpdateRegistrationRequest, RegistrationResponse,
  RegistrationListItem, PagedResponse, RegistrationFilter,
  DashboardResponse, AuditLogResponse, AuditFilter,
} from '../types';

// Auth
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data).then(r => r.data),
};

// DNI
export const dniApi = {
  lookup: (dni: string) =>
    api.get<DniLookupResponse>(`/dni/${dni}`).then(r => r.data),
};

// Registrations
export const registrationApi = {
  create: (data: CreateRegistrationRequest) =>
    api.post<RegistrationResponse>('/registrations', data).then(r => r.data),
  
  getAll: (filter: RegistrationFilter) =>
    api.get<PagedResponse<RegistrationListItem>>('/registrations', { params: filter }).then(r => r.data),
  
  getById: (id: number) =>
    api.get<RegistrationResponse>(`/registrations/${id}`).then(r => r.data),
  
  update: (id: number, data: UpdateRegistrationRequest) =>
    api.post<RegistrationResponse>(`/registrations/update/${id}`, data).then(r => r.data),
  
  checkDni: (dni: string) =>
    api.get<{ exists: boolean }>(`/registrations/check-dni/${dni}`).then(r => r.data),
    
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/registrations/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
  
  notify: (id: number, method: 'email' | 'whatsapp') =>
    api.post<{ message: string }>(`/registrations/${id}/notify?method=${method}`).then(r => r.data),

  deleteAll: () =>
    api.delete<{ message: string; deletedCount: number }>('/registrations').then(r => r.data),
};

// Dashboard
export const dashboardApi = {
  get: () =>
    api.get<DashboardResponse>('/dashboard').then(r => r.data),
};

// Audit
export const auditApi = {
  getLogs: (filter: AuditFilter) =>
    api.get<PagedResponse<AuditLogResponse>>('/audit', { params: filter }).then(r => r.data),
};

// Sync
export const syncApi = {
  updateStatus: (registrationId: number, syncStatus: string, syncMessage?: string) =>
    api.put<RegistrationResponse>(`/sync/${registrationId}`, { syncStatus, syncMessage }).then(r => r.data),
  
  simulateBatch: () =>
    api.post<{ message: string }>('/sync/simulate-batch').then(r => r.data),
};

// PDF
export const pdfApi = {
  downloadConstancia: (registrationId: number) =>
    api.get(`/pdf/constancia/${registrationId}`, { responseType: 'blob' }).then(r => {
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `constancia_${registrationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }),
};

// Export
export const exportApi = {
  downloadCsv: (filter: RegistrationFilter) =>
    api.get('/export/csv', { params: filter, responseType: 'blob' }).then(r => {
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `registros_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }),
};

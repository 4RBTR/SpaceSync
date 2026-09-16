// Re-export types
export type { ApiResponse, ApiError } from './api/client';

import { axiosClient } from './api/client';
import { authApi } from './api/auth';
import { spacesApi } from './api/spaces';
import { reservationsApi } from './api/reservations';
import { adminApi } from './api/admin';
import { uploadApi } from './api/upload';

// Re-export uploadApi for direct use in pages
export { uploadApi };

/**
 * Facade pattern to maintain backward compatibility with existing code.
 * All API calls are now modularized in src/lib/api/* but exported as a single object here.
 */
export const apiClient = {
  // Base client methods
  setToken: (token: string) => axiosClient.setToken(token),
  getToken: () => axiosClient.getToken(),
  clearAuth: () => axiosClient.clearAuth(),
  loadToken: () => axiosClient.loadToken(),
  getStatus: () => axiosClient.getStatus(),
  getHealth: () => axiosClient.getHealth(),
  
  // Expose the raw Axios instance if needed
  get instance() {
    return axiosClient.instance;
  },

  // Auth
  registerMember: (data: any) => authApi.registerMember(data),
  registerAdminSpace: (data: any) => authApi.registerAdminSpace(data),
  login: (username: string, password: string) => authApi.login(username, password),
  getProfile: () => authApi.getProfile(),
  updateMemberProfile: (id: string | number, data: any) => authApi.updateMemberProfile(id, data),

  // Spaces & Diskon
  getSpaceTypes: () => spacesApi.getSpaceTypes(),
  getSpaceAvailability: (date: string, jam: string) => spacesApi.getSpaceAvailability(date, jam),
  getAllSpaces: (filters?: any) => spacesApi.getAllSpaces(filters),
  getSpaceDetail: (id: string) => spacesApi.getSpaceDetail(id),
  getActiveDiskon: () => spacesApi.getActiveDiskon(),
  checkDiskonCode: (code: string) => spacesApi.checkDiskonCode(code),
  getDiskonDetail: (id: string) => spacesApi.getDiskonDetail(id),

  // Reservations
  createReservation: (data: any) => reservationsApi.createReservation(data),
  getMyReservations: () => reservationsApi.getMyReservations(),
  getMyReservationHistory: (month: number, year: number) => reservationsApi.getMyReservationHistory(month, year),
  getReservationETicket: (id: string) => reservationsApi.getReservationETicket(id),
  getReservationDetail: (id: string) => reservationsApi.getReservationDetail(id),
  cancelReservation: (id: string) => reservationsApi.cancelReservation(id),

  // Admin Maker
  getMakerInfo: () => adminApi.getMakerInfo(),
  getMakerStats: () => adminApi.getMakerStats(),
  
  // Admin Profile
  getAdminProfile: () => adminApi.getAdminProfile(),
  updateAdminProfile: (data: any) => adminApi.updateAdminProfile(data),

  // Admin Members
  getAdminMembers: (page?: number, limit?: number) => adminApi.getAdminMembers(page, limit),
  getAdminMemberDetail: (id: string) => adminApi.getAdminMemberDetail(id),
  createAdminMember: (data: any) => adminApi.createAdminMember(data),
  updateAdminMember: (id: string, data: any) => adminApi.updateAdminMember(id, data),
  deleteAdminMember: (id: string) => adminApi.deleteAdminMember(id),

  // Admin Spaces
  getAdminSpaces: (page?: number, limit?: number) => adminApi.getAdminSpaces(page, limit),
  getAdminSpaceDetail: (id: string) => adminApi.getAdminSpaceDetail(id),
  createAdminSpace: (data: any) => adminApi.createAdminSpace(data),
  updateAdminSpace: (id: string, data: any) => adminApi.updateAdminSpace(id, data),
  deleteAdminSpace: (id: string) => adminApi.deleteAdminSpace(id),

  // Admin Diskon
  getAdminDiskon: (page?: number, limit?: number) => adminApi.getAdminDiskon(page, limit),
  getAdminDiskonDetail: (id: string) => adminApi.getAdminDiskonDetail(id),
  createAdminDiskon: (data: any) => adminApi.createAdminDiskon(data),
  updateAdminDiskon: (id: string, data: any) => adminApi.updateAdminDiskon(id, data),
  deleteAdminDiskon: (id: string) => adminApi.deleteAdminDiskon(id),

  // Admin Reservations
  getAdminReservations: (filters?: any) => adminApi.getAdminReservations(filters),
  getAdminReservationDetail: (id: string) => adminApi.getAdminReservationDetail(id),
  confirmReservation: (id: string) => adminApi.confirmReservation(id),
  updateReservationStatus: (id: string, status: string) => adminApi.updateReservationStatus(id, status),
  checkInReservation: (id: string) => adminApi.checkInReservation(id),
  checkOutReservation: (id: string) => adminApi.checkOutReservation(id),

  // Admin Reports
  getMonthlyReports: (month: number, year: number) => adminApi.getMonthlyReports(month, year),
  getIncomeReports: (month: number, year: number) => adminApi.getIncomeReports(month, year),

  // Upload
  uploadImage: (file: File, folder: 'spaces' | 'members' | 'general') => uploadApi.uploadImage(file, folder),
};

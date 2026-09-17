import { axiosClient, ApiResponse } from './client';

class AdminApi {
  // Maker endpoints
  async getMakerInfo(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/maker/me').then((res) => res.data);
  }

  async getMakerStats(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/maker/stats').then((res) => res.data);
  }

  // Admin Profile
  async getAdminProfile(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/admin/profile').then((res) => res.data);
  }

  async updateAdminProfile(data: {
    nama_coworking?: string;
    nama_pemilik?: string;
    alamat?: string;
    no_telepon?: string;
    telp?: string;
    deskripsi?: string;
    foto?: string;
  }): Promise<ApiResponse> {
    const payload: any = { ...data };
    if (payload.no_telepon && !payload.telp) {
      payload.telp = payload.no_telepon;
    }
    return axiosClient.instance
      .put('/api/admin/profile', payload)
      .then((res) => res.data);
  }

  // Admin Members endpoints
  async getAdminMembers(page?: number, limit?: number): Promise<ApiResponse> {
    return axiosClient.instance
      .get('/api/admin/members', { params: { page, limit } })
      .then((res) => res.data);
  }

  async getAdminMemberDetail(id: string): Promise<ApiResponse> {
    return axiosClient.instance.get(`/api/admin/members/${id}`).then((res) => res.data);
  }

  async createAdminMember(data: any): Promise<ApiResponse> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return axiosClient.instance
      .post('/api/admin/members', formData)
      .then((res) => res.data);
  }

  async updateAdminMember(id: string, data: any): Promise<ApiResponse> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return axiosClient.instance
      .put(`/api/admin/members/${id}`, formData)
      .then((res) => res.data);
  }

  async deleteAdminMember(id: string): Promise<ApiResponse> {
    return axiosClient.instance.delete(`/api/admin/members/${id}`).then((res) => res.data);
  }

  // Admin Spaces endpoints
  async getAdminSpaces(page?: number, limit?: number): Promise<ApiResponse> {
    return axiosClient.instance
      .get('/api/admin/spaces', { params: { page, limit } })
      .then((res) => res.data);
  }

  async getAdminSpaceDetail(id: string): Promise<ApiResponse> {
    return axiosClient.instance.get(`/api/admin/spaces/${id}`).then((res) => res.data);
  }

  async createAdminSpace(data: any): Promise<ApiResponse> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return axiosClient.instance
      .post('/api/admin/spaces', formData)
      .then((res) => res.data);
  }

  async updateAdminSpace(id: string, data: any): Promise<ApiResponse> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return axiosClient.instance
      .put(`/api/admin/spaces/${id}`, formData)
      .then((res) => res.data);
  }

  async deleteAdminSpace(id: string): Promise<ApiResponse> {
    return axiosClient.instance.delete(`/api/admin/spaces/${id}`).then((res) => res.data);
  }

  // Admin Diskon endpoints
  async getAdminDiskon(page?: number, limit?: number): Promise<ApiResponse> {
    return axiosClient.instance
      .get('/api/admin/diskon', { params: { page, limit } })
      .then((res) => res.data);
  }

  async getAdminDiskonDetail(id: string): Promise<ApiResponse> {
    return axiosClient.instance.get(`/api/admin/diskon/${id}`).then((res) => res.data);
  }

  async createAdminDiskon(data: any): Promise<ApiResponse> {
    return axiosClient.instance.post('/api/admin/diskon', data).then((res) => res.data);
  }

  async updateAdminDiskon(id: string, data: any): Promise<ApiResponse> {
    return axiosClient.instance
      .put(`/api/admin/diskon/${id}`, data)
      .then((res) => res.data);
  }

  async deleteAdminDiskon(id: string): Promise<ApiResponse> {
    return axiosClient.instance.delete(`/api/admin/diskon/${id}`).then((res) => res.data);
  }

  // Admin Reservation endpoints
  async getAdminReservations(filters?: {
    status?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    return axiosClient.instance
      .get('/api/admin/reservasi', { params: filters })
      .then((res) => res.data);
  }

  async getAdminReservationDetail(id: string): Promise<ApiResponse> {
    try {
      return await axiosClient.instance
        .get(`/api/reservasi/${id}`)
        .then((res) => res.data);
    } catch (err) {
      return axiosClient.instance
        .get(`/api/admin/reservasi/${id}`)
        .then((res) => res.data);
    }
  }

  async confirmReservation(id: string): Promise<ApiResponse> {
    return axiosClient.instance
      .patch(`/api/admin/reservasi/${id}/status`, { status: 'disetujui' })
      .then((res) => res.data);
  }

  async updateReservationStatus(id: string, status: string): Promise<ApiResponse> {
    const statusMap: Record<string, string> = {
      'Belum Dikonfirmasi': 'belum_dikonfirm',
      'Disetujui': 'disetujui',
      'Aktif/Digunakan': 'aktif',
      'Aktif': 'aktif',
      'Selesai': 'selesai',
      'Dibatalkan': 'dibatalkan',
    };
    const backendStatus = statusMap[status] || status.toLowerCase();
    return axiosClient.instance
      .patch(`/api/admin/reservasi/${id}/status`, { status: backendStatus })
      .then((res) => res.data);
  }

  async checkInReservation(id: string): Promise<ApiResponse> {
    return axiosClient.instance
      .post(`/api/admin/reservasi/${id}/check-in`, {})
      .then((res) => res.data);
  }

  async checkOutReservation(id: string): Promise<ApiResponse> {
    return axiosClient.instance
      .post(`/api/admin/reservasi/${id}/check-out`, {})
      .then((res) => res.data);
  }

  // Admin Reports endpoints
  async getAdminReports(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/admin/reports').then((res) => res.data);
  }

  async getMonthlyReports(month: number, year: number): Promise<ApiResponse> {
    return axiosClient.instance
      .get('/api/admin/reports/monthly', { params: { month, year } })
      .then((res) => res.data);
  }

  async getIncomeReports(month: number, year: number): Promise<ApiResponse> {
    return axiosClient.instance
      .get('/api/admin/reports/income', { params: { month, year } })
      .then((res) => res.data);
  }
}

export const adminApi = new AdminApi();

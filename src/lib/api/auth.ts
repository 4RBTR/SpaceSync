import { axiosClient, ApiResponse } from './client';

class AuthApi {
  async registerMember(data: {
    nama_member: string;
    instansi: string;
    no_telepon: string;
    alamat: string;
    username: string;
    password: string;
    foto?: File;
  }): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('nama_member', data.nama_member);
    formData.append('instansi', data.instansi);
    formData.append('telp', data.no_telepon);
    formData.append('alamat', data.alamat);
    formData.append('username', data.username);
    formData.append('password', data.password);
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    return axiosClient.instance
      .post('/api/auth/register/member', formData)
      .then((res) => res.data);
  }

  async registerAdminSpace(data: {
    nama_coworking: string;
    nama_pemilik: string;
    alamat: string;
    no_telepon: string;
    username: string;
    password: string;
    foto?: File;
  }): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('nama_coworking', data.nama_coworking);
    formData.append('nama_pemilik', data.nama_pemilik);
    formData.append('alamat', data.alamat);
    formData.append('telp', data.no_telepon);
    formData.append('username', data.username);
    formData.append('password', data.password);
    if (data.foto) {
      formData.append('foto', data.foto);
    }

    return axiosClient.instance
      .post('/api/auth/register/admin-space', formData)
      .then((res) => res.data);
  }

  async login(username: string, password: string): Promise<ApiResponse> {
    return axiosClient.instance
      .post('/api/auth/login', { username, password })
      .then((res) => res.data);
  }

  /**
   * Get logged-in user profile
   */
  async getProfile(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/auth/profile').then((res) => res.data);
  }

  /**
   * Update logged-in user profile (nama, instansi, telp, alamat, foto)
   */
  async updateProfile(data: {
    nama_member?: string;
    instansi?: string;
    telp?: string;
    no_telepon?: string;
    alamat?: string;
    foto?: string;
  }): Promise<ApiResponse> {
    const payload = { ...data };
    if (payload.no_telepon && !payload.telp) {
      payload.telp = payload.no_telepon;
    }
    return axiosClient.instance
      .put('/api/auth/profile', payload)
      .then((res) => res.data);
  }

  /**
   * Change user password
   */
  async updatePassword(data: {
    old_password?: string;
    new_password?: string;
    password_lama?: string;
    password_baru?: string;
  }): Promise<ApiResponse> {
    return axiosClient.instance
      .put('/api/auth/change-password', data)
      .then((res) => res.data);
  }

  /**
   * Update member profile (Admin operation)
   */
  async updateMemberProfile(
    memberId: string | number,
    data: {
      nama_member?: string;
      instansi?: string;
      no_telepon?: string;
      telp?: string;
      alamat?: string;
      foto?: string;
    }
  ): Promise<ApiResponse> {
    const payload: Record<string, any> = { ...data };
    if (payload.no_telepon && !payload.telp) {
      payload.telp = payload.no_telepon;
    }
    if (payload.telp && !payload.no_telepon) {
      payload.no_telepon = payload.telp;
    }

    return axiosClient.instance
      .put(`/api/admin/members/${memberId}`, payload)
      .then((res) => res.data);
  }
}

export const authApi = new AuthApi();


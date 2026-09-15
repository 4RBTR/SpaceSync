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

  async getProfile(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/auth/profile').then((res) => res.data);
  }
}

export const authApi = new AuthApi();

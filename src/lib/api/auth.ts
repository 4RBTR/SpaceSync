import { axiosClient, ApiResponse } from './client';
import { uploadApi } from './upload';

class AuthApi {
  async registerMember(data: {
    nama_member: string;
    instansi: string;
    no_telepon: string;
    alamat: string;
    username: string;
    password: string;
    foto?: File | string | null;
  }): Promise<ApiResponse> {
    let fotoUrl: string | undefined = undefined;
    if (data.foto instanceof File) {
      try {
        const uploadRes = await uploadApi.uploadImage(data.foto, 'members');
        fotoUrl = uploadRes.data?.url || uploadRes.data?.foto_url || uploadRes.data?.path || (typeof uploadRes.data === 'string' ? uploadRes.data : undefined);
      } catch (e) {
        console.warn('Gagal mengunggah foto member sebelum registrasi:', e);
      }
    } else if (typeof data.foto === 'string') {
      fotoUrl = data.foto;
    }

    const payload: any = {
      nama_member: data.nama_member,
      instansi: data.instansi || '-',
      telp: data.no_telepon || '-',
      no_telepon: data.no_telepon || '-',
      alamat: data.alamat || '-',
      username: data.username,
      password: data.password,
    };
    if (fotoUrl) {
      payload.foto = fotoUrl;
    }

    return axiosClient.instance
      .post('/api/auth/register/member', payload)
      .then((res) => res.data);
  }

  async registerAdminSpace(data: {
    nama_coworking: string;
    nama_pemilik: string;
    alamat: string;
    no_telepon: string;
    username: string;
    password: string;
    foto?: File | string | null;
  }): Promise<ApiResponse> {
    let fotoUrl: string | undefined = undefined;
    if (data.foto instanceof File) {
      try {
        const uploadRes = await uploadApi.uploadImage(data.foto, 'general');
        fotoUrl = uploadRes.data?.url || uploadRes.data?.foto_url || uploadRes.data?.path || (typeof uploadRes.data === 'string' ? uploadRes.data : undefined);
      } catch (e) {
        console.warn('Gagal mengunggah foto space sebelum registrasi:', e);
      }
    } else if (typeof data.foto === 'string') {
      fotoUrl = data.foto;
    }

    const payload: any = {
      nama_coworking: data.nama_coworking,
      nama_pemilik: data.nama_pemilik || '-',
      alamat: data.alamat || '-',
      telp: data.no_telepon || '-',
      no_telepon: data.no_telepon || '-',
      username: data.username,
      password: data.password,
    };
    if (fotoUrl) {
      payload.foto = fotoUrl;
    }

    return axiosClient.instance
      .post('/api/auth/register/admin-space', payload)
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


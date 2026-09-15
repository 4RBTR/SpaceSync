import { axiosClient, ApiResponse } from './client';

class SpacesApi {
  // Space endpoints
  async getSpaceTypes(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/spaces/types').then((res) => res.data);
  }

  async getSpaceAvailability(date: string, jam: string): Promise<ApiResponse> {
    return axiosClient.instance
      .get('/api/spaces/availability', { params: { date, jam } })
      .then((res) => res.data);
  }

  async getAllSpaces(filters?: {
    type?: string;
    search?: string;
  }): Promise<ApiResponse> {
    return axiosClient.instance
      .get('/api/spaces', { params: filters })
      .then((res) => res.data);
  }

  async getSpaceDetail(id: string): Promise<ApiResponse> {
    return axiosClient.instance.get(`/api/spaces/${id}`).then((res) => res.data);
  }

  // Diskon endpoints
  async getActiveDiskon(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/diskon/active').then((res) => res.data);
  }

  async checkDiskonCode(code: string): Promise<ApiResponse> {
    return axiosClient.instance
      .post('/api/diskon/check', { kode_diskon: code })
      .then((res) => res.data);
  }

  async getDiskonDetail(id: string): Promise<ApiResponse> {
    return axiosClient.instance.get(`/api/diskon/${id}`).then((res) => res.data);
  }
}

export const spacesApi = new SpacesApi();

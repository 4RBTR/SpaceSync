import { axiosClient, ApiResponse } from './client';

class UploadApi {
  async uploadImage(file: File, folder: 'spaces' | 'members' | 'general'): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return axiosClient.instance
      .post(`/api/upload/${folder}`, formData)
      .then((res) => res.data);
  }
}

export const uploadApi = new UploadApi();

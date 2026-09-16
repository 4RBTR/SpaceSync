import { axiosClient, ApiResponse } from './client';

class UploadApi {
  async uploadImage(file: File, folder: 'spaces' | 'members' | 'general' = 'general'): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = folder === 'general' ? '/api/upload/image' : `/api/upload/${folder}`;

    return axiosClient.instance
      .post(endpoint, formData)
      .then((res) => res.data);
  }
}

export const uploadApi = new UploadApi();

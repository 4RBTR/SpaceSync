import { axiosClient, ApiResponse } from './client';

class ReservationsApi {
  async createReservation(data: {
    id_space: string;
    tanggal_reservasi: string;
    jam_mulai: string;
    durasi_jam: number;
    id_diskon?: string;
  }): Promise<ApiResponse> {
    return axiosClient.instance
      .post('/api/reservasi', data)
      .then((res) => res.data);
  }

  async getMyReservations(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/reservasi/my').then((res) => res.data);
  }

  async getMyActiveReservations(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/reservasi/my/active').then((res) => res.data);
  }

  async getMyHistoryReservations(): Promise<ApiResponse> {
    return axiosClient.instance.get('/api/reservasi/my/history').then((res) => res.data);
  }

  async getMyReservationHistory(month: number, year: number): Promise<ApiResponse> {
    return axiosClient.instance
      .get('/api/reservasi/my/history', { params: { month, year } })
      .then((res) => res.data);
  }

  async getETicket(id: string): Promise<ApiResponse> {
    return axiosClient.instance
      .get(`/api/reservasi/${id}/e-ticket`)
      .then((res) => res.data);
  }

  async getReservationETicket(id: string): Promise<ApiResponse> {
    return axiosClient.instance
      .get(`/api/reservasi/${id}/e-ticket`)
      .then((res) => res.data);
  }

  async getReservationDetail(id: string): Promise<ApiResponse> {
    return axiosClient.instance.get(`/api/reservasi/${id}`).then((res) => res.data);
  }

  async cancelReservation(id: string): Promise<ApiResponse> {
    return axiosClient.instance
      .patch(`/api/reservasi/${id}/cancel`)
      .then((res) => res.data);
  }
}

export const reservationsApi = new ReservationsApi();

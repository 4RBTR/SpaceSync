import axios, { AxiosInstance, AxiosError } from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

export interface ApiResponse<T = any> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  status: boolean;
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
}

class AxiosClient {
  public instance: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-maker-key': APP_KEY,
      },
    });

    // Interceptor untuk menambahkan token ke setiap request
    this.instance.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Interceptor untuk error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Clear token dan redirect ke login jika unauthorized
          this.clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  getToken(): string | null {
    return this.accessToken;
  }

  clearAuth(): void {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_data');
    }
  }

  async loadToken(): Promise<void> {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        this.accessToken = token;
      }
    }
  }

  async getStatus(): Promise<ApiResponse> {
    return this.instance.get('/').then((res) => res.data);
  }

  async getHealth(): Promise<ApiResponse> {
    return this.instance.get('/health').then((res) => res.data);
  }
}

export const axiosClient = new AxiosClient();

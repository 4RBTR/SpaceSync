'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, ApiResponse } from './api';

export type UserRole = 'member' | 'admin_space';

export interface AuthUser {
  id: string;
  nama_member?: string;
  nama_coworking?: string;
  nama_pemilik?: string;
  username: string;
  role: UserRole;
  email?: string;
  no_telepon?: string;
  telp?: string;
  alamat?: string;
  instansi?: string;
  deskripsi?: string;
  foto?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  registerMember: (data: any) => Promise<void>;
  registerAdminSpace: (data: any) => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await apiClient.loadToken();
        const token = apiClient.getToken();

        if (token) {
          const response = await apiClient.getProfile();
          if (response.status && response.data) {
            const userData = response.data;
            const role = (localStorage.getItem('user_type') as UserRole) || userData.role || 'member';

            const memberObj = userData.member || {};
            const ownerObj = userData.space_owner || {};

            let savedLocal: any = {};
            try {
              const localRaw = localStorage.getItem('user_data');
              if (localRaw) savedLocal = JSON.parse(localRaw);
            } catch (e) {
              // ignore json error
            }

            const mergedUser: AuthUser = {
              id: userData.id || memberObj.id || ownerObj.id || savedLocal.id || '',
              username: userData.username || savedLocal.username || '',
              role,
              nama_member: savedLocal.nama_member || memberObj.nama_member || userData.nama_member || '',
              nama_coworking: savedLocal.nama_coworking || ownerObj.nama_coworking || userData.nama_coworking || '',
              nama_pemilik: savedLocal.nama_pemilik || ownerObj.nama_pemilik || userData.nama_pemilik || '',
              instansi: savedLocal.instansi || memberObj.instansi || userData.instansi || '',
              no_telepon: savedLocal.no_telepon || savedLocal.telp || memberObj.telp || ownerObj.telp || userData.telp || userData.no_telepon || '',
              telp: savedLocal.telp || savedLocal.no_telepon || memberObj.telp || ownerObj.telp || userData.telp || userData.no_telepon || '',
              alamat: savedLocal.alamat || memberObj.alamat || ownerObj.alamat || userData.alamat || '',
              deskripsi: savedLocal.deskripsi || ownerObj.deskripsi || userData.deskripsi || '',
              foto: savedLocal.foto || memberObj.foto || ownerObj.foto || userData.foto || '',
              foto_url: savedLocal.foto_url || memberObj.foto_url || ownerObj.foto_url || userData.foto_url || '',
              ...memberObj,
              ...ownerObj,
              ...userData,
              ...savedLocal,
            };

            setUser(mergedUser);
            setUserRole(role);
            localStorage.setItem('user_data', JSON.stringify(mergedUser));
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        apiClient.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(username, password);
      
      const payload: any = response.data;
      const token = payload?.token || payload?.access_token || response.data;
      const userObj = payload?.user || payload?.member || payload?.admin || payload;

      if (!token || typeof token !== 'string') {
        throw new Error(response.message || 'Token login tidak valid dari server');
      }

      apiClient.setToken(token);
      
      const isMember = !!(userObj?.nama_member || payload?.member || userObj?.role === 'member');
      const role: UserRole = isMember ? 'member' : 'admin_space';

      const memberObj = userObj?.member || (role === 'member' ? userObj : {});
      const ownerObj = userObj?.space_owner || (role === 'admin_space' ? userObj : {});

      const userObjTyped: AuthUser = {
        id: userObj?.id || memberObj?.id || ownerObj?.id || '',
        username: userObj?.username || username,
        role,
        nama_member: memberObj?.nama_member || userObj?.nama_member || '',
        nama_coworking: ownerObj?.nama_coworking || userObj?.nama_coworking || '',
        nama_pemilik: ownerObj?.nama_pemilik || userObj?.nama_pemilik || '',
        instansi: memberObj?.instansi || userObj?.instansi || '',
        no_telepon: memberObj?.telp || ownerObj?.telp || userObj?.no_telepon || userObj?.telp || '',
        telp: memberObj?.telp || ownerObj?.telp || userObj?.no_telepon || userObj?.telp || '',
        alamat: memberObj?.alamat || ownerObj?.alamat || userObj?.alamat || '',
        deskripsi: ownerObj?.deskripsi || userObj?.deskripsi || '',
        foto: memberObj?.foto || ownerObj?.foto || userObj?.foto || '',
        foto_url: memberObj?.foto_url || ownerObj?.foto_url || userObj?.foto_url || '',
        ...memberObj,
        ...ownerObj,
        ...userObj,
      };

      // Simpan di localStorage & cookie
      localStorage.setItem('user_type', role);
      localStorage.setItem('user_data', JSON.stringify(userObjTyped));
      
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_type=${role}; path=/; max-age=86400; SameSite=Lax`;

      setUser(userObjTyped);
      setUserRole(role);
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      apiClient.clearAuth();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.clearAuth();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    setUserRole(null);
  };

  const registerMember = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await apiClient.registerMember(data);

      if (!response.status) {
        throw new Error(response.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerAdminSpace = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await apiClient.registerAdminSpace(data);

      if (!response.status) {
        throw new Error(response.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        userRole,
        login,
        logout,
        registerMember,
        registerAdminSpace,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient, ApiResponse } from './api';
import { useRouter } from 'next/navigation';

export function useApi<T>(
  asyncFn: () => Promise<ApiResponse<T>>,
  immediate = true
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const asyncFnRef = useRef(asyncFn);
  const hasRun = useRef(false);

  // Keep the ref up to date
  asyncFnRef.current = asyncFn;

  const execute = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await asyncFnRef.current();

      if (response.status) {
        setData(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, isLoading, error, execute, setData };
}

export function useProtectedRoute() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  return !!token;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export function useFormData<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setFormData((prev) => ({
        ...prev,
        [name]: val,
      }));
    },
    []
  );

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setFormData(initialState);
  }, [initialState]);

  return {
    formData,
    setFormData,
    handleChange,
    handleFileChange,
    reset,
  };
}

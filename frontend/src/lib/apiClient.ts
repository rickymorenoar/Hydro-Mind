const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hydromind_token') : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `API error ${res.status}`);
  }
  return res.json();
}

// Auth
export const login = (email: string, password: string) =>
  fetchApi<{ token: string; user: any }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (name: string, email: string, password: string) =>
  fetchApi<{ token: string; user: any }>('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

// Dashboard
export const getDevices = () =>
  fetchApi<any[]>('/dashboard/devices');

export const createDevice = (name: string) =>
  fetchApi<{ id: number; api_key: string }>('/dashboard/devices', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

export const getLatest = (deviceId: number) =>
  fetchApi<any>(`/dashboard/devices/${deviceId}/latest`);

export const getHistory = (deviceId: number, metric: string, range: string) =>
  fetchApi<any[]>(`/dashboard/devices/${deviceId}/history?metric=${metric}&range=${range}`);

export const getNotifications = (deviceId: number, page = 1) =>
  fetchApi<any>(`/dashboard/devices/${deviceId}/notifications?page=${page}`);

export const updateSettings = (deviceId: number, payload: Record<string, any>) =>
  fetchApi<any>(`/dashboard/devices/${deviceId}/settings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

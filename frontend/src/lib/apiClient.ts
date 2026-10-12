const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hydromind_token') : null;
  
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (netErr: any) {
    throw new Error('Gagal terhubung ke server backend. Pastikan server aktif.');
  }

  // Handle expired token on authenticated routes
  if (res.status === 401 && path !== '/login' && path !== '/register') {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hydromind_token');
      localStorage.removeItem('hydromind_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
  }

  if (!res.ok) {
    let errorMessage = `Terjadi kesalahan (Kode: ${res.status})`;
    let errors: any = {};
    try {
      const data = await res.json();
      if (data.message) {
        errorMessage = data.message;
      }
      if (data.errors && typeof data.errors === 'object') {
        errors = data.errors;
      }
    } catch {
      // JSON parse failed
      if (res.statusText) errorMessage = res.statusText;
    }
    throw { message: errorMessage, errors };
  }

  return res.json();
}


// Auth
export const login = (email: string, password: string) =>
  fetchApi<{ token: string; user: any }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (name: string, email: string, password: string, role = 'member') =>
  fetchApi<{ token: string; user: any }>('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });

export const getMe = () =>
  fetchApi<{ user: any }>('/me');

export const logout = () =>
  fetchApi<{ message: string }>('/logout', {
    method: 'POST',
  });

// User Management (Admin only)
export const getUsers = () =>
  fetchApi<any[]>('/dashboard/users');

export const createUser = (payload: { name: string; email: string; password: string; role: string }) =>
  fetchApi<{ message: string; user: any }>('/dashboard/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deleteUser = (userId: number) =>
  fetchApi<{ message: string }>(`/dashboard/users/${userId}`, {
    method: 'DELETE',
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


import axios from 'axios';

export const storage = {
  get: () => JSON.parse(localStorage.getItem('auth') || 'null'),
  set: (v) => localStorage.setItem('auth', JSON.stringify(v)),
  clear: () => localStorage.removeItem('auth'),
};

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const auth = storage.get();
  if (auth?.accessToken) config.headers.Authorization = `Bearer ${auth.accessToken}`;
  return config;
});

let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const auth = storage.get();
    const isAuthCall = original?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !original._retry && !isAuthCall && auth?.refreshToken) {
      original._retry = true;
      try {
        refreshing ??= axios.post('/api/auth/refresh', { refreshToken: auth.refreshToken })
          .finally(() => { refreshing = null; });
        const { data } = await refreshing;
        storage.set(data);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
      }
    }
    if (error.response?.status === 401 && !isAuthCall) {
      storage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (e) => {
  const d = e.response?.data;
  if (d?.details) return Object.entries(d.details).map(([k, v]) => `${k}: ${v}`).join(', ');
  return d?.message || e.message || 'Something went wrong';
};

export default api;

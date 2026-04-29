import axios from 'axios';
import type { AuthResponse, WorkRecord, MonthlyStats } from '../types';

// 自动检测API地址
const getApiUrl = () => {
  // 生产环境使用相对路径
  if (import.meta.env.PROD) {
    return '/api';
  }
  // 开发环境使用环境变量或默认值
  return import.meta.env.VITE_API_URL || '/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async register(username: string, password: string, fullname: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      username,
      password,
      fullname,
    });
    return data;
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      username,
      password,
    });
    return data;
  },

  async getCurrentUser() {
    const { data } = await api.get('/auth/me');
    return data.user;
  },
};

export const recordService = {
  async createRecord(record: Partial<WorkRecord>): Promise<WorkRecord> {
    const { data } = await api.post('/records', record);
    return data.record;
  },

  async updateRecord(id: number, updates: Partial<WorkRecord>): Promise<WorkRecord> {
    const { data } = await api.put(`/records/${id}`, updates);
    return data.record;
  },

  async deleteRecord(id: number): Promise<void> {
    await api.delete(`/records/${id}`);
  },

  async getRecords(limit = 100, offset = 0): Promise<WorkRecord[]> {
    const { data } = await api.get('/records', { params: { limit, offset } });
    return data.records;
  },

  async getMonthlyRecords(year: number, month: number): Promise<MonthlyStats> {
    const { data } = await api.get(`/records/month/${year}/${month}`);
    return data;
  },

  async syncRecords(records: WorkRecord[]): Promise<void> {
    await api.post('/records/sync', { records });
  },

  async exportRecords(): Promise<Blob> {
    const { data } = await api.get('/records/export', {
      responseType: 'blob',
    });
    return data;
  },
};

export default api;

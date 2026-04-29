export interface User {
  id: number;
  username: string;
  fullname: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface WorkRecord {
  id?: number;
  user_id?: number;
  clock_in: string;
  clock_out: string | null;
  work_hours: number | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyStats {
  totalHours: number;
  totalDays: number;
  records: WorkRecord[];
}

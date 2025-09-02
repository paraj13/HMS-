// types/user.ts
export interface User {
  id?: string;
  username: string;
  email: string;
  mobile_no: string;
  password?: string;
  role: string;
  city?: string;
  is_active?: boolean;
  image?: string;
}

export interface UserLoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface DashboardData {
  total_users: number;
  role_counts: {
    management: number;
    hotel_staff: number;
    guest: number;
  };
}

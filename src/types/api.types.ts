// User types
export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface UserRole {
  roleId: string;
  role: Role;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  roles: UserRole[];
  createdAt?: string;
  updatedAt?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

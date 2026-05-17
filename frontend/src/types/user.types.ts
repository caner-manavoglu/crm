export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: UserRole;
  departmentId?: string;
  cityId?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  department?: { id: string; name: string };
  city?: { id: string; name: string };
}

export interface City {
  id: string;
  name: string;
  code: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  department: Department;
  isActive: boolean;
}

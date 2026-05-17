export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',

  CUSTOMER: {
    HOME: '/customer',
    SUBMIT: '/customer/submit',
    COMPLAINTS: '/customer/complaints',
    COMPLAINT_DETAIL: (id: string) => `/customer/complaints/${id}`,
  },

  STAFF: {
    HOME: '/staff',
    DASHBOARD: '/staff/dashboard',
    COMPLAINTS: '/staff/complaints',
    COMPLAINT_WORK: (id: string) => `/staff/complaints/${id}`,
  },

  ADMIN: {
    HOME: '/admin',
    DASHBOARD: '/admin/dashboard',
    STAFF: '/admin/staff',
    STAFF_NEW: '/admin/staff/new',
    STAFF_EDIT: (id: string) => `/admin/staff/${id}/edit`,
    DEPARTMENTS: '/admin/departments',
    CATEGORIES: '/admin/categories',
    CITIES: '/admin/cities',
    COMPLAINTS: '/admin/complaints',
    COMPLAINT_POOL: '/admin/complaints/pool',
    ANALYTICS: '/admin/analytics',
  },
};

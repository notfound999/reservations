import axios from 'axios';
import type {
  SignInRequest,
  UserRequest,
  AuthResponse,
  BusinessRequest,
  Business,
  BusinessPhoto,
  OfferingRequest,
  Offering,
  ScheduleSettingsRequest,
  ScheduleSettings,
  BusyBlock,
  ReservationRequest,
  Reservation,
  Review,
  User,
  TimeOffRequest,
  TimeOff,
  Notification,
  UnreadCountResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Export the base URL without /api for image URLs
export const getBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  // Remove /api from the end to get base URL for images
  return apiUrl.replace(/\/api$/, '');
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  // Only send the header if the token is a real JWT (contains dots)
  // Real JWTs look like: xxxxx.yyyyy.zzzzz
  if (token && token.includes('.')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Helper to extract error message from various response formats
export const extractErrorMessage = (error: any): string => {
  if (error.response?.data) {
    const data = error.response.data;
    // Handle different backend error formats
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.join(', ');
    }
  }
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Add a message to sessionStorage so Index can show it
      sessionStorage.setItem('authError', 'Session expired. Please log in again.');
      window.location.href = '/';
    }
    // Attach extracted message to error for easy access
    error.displayMessage = extractErrorMessage(error);
    return Promise.reject(error);
  }
);

// ===== Auth API =====
export const authApi = {
  signIn: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/signin', data);
    return response.data;
  },

  signUp: async (data: Omit<UserRequest, "confirmPassword">): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// ===== User API =====
export const userApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/me');
    return response.data;
  },

  updateProfile: async (data: { name: string; email: string; phone?: string; password?: string }): Promise<void> => {
    await api.put('/me', data);
  },
};

// ===== Business API =====
export const businessApi = {
  getAll: async (): Promise<Business[]> => {
    const response = await api.get('/businesses');
    return response.data;
  },

  getById: async (id: string): Promise<Business> => {
    const response = await api.get(`/businesses/by-business-id/${id}`);
    return response.data;
  },

  create: async (data: BusinessRequest): Promise<Business> => {
    const response = await api.post('/businesses/create', data);
    return response.data;
  },

  update: async (id: string, data: BusinessRequest): Promise<Business> => {
    const response = await api.put(`/businesses/update/${id}`, data);
    return response.data;
  },

  getMyBusinesses: async (): Promise<Business[]> => {
    const response = await api.get('/me/businesses');
    return response.data;
  },
};

// ===== Offerings API =====
export const offeringsApi = {
  getByBusiness: async (businessId: string): Promise<Offering[]> => {
    const response = await api.get(`/offerings/business/${businessId}`);
    return response.data;
  },

  create: async (businessId: string, data: OfferingRequest): Promise<Offering> => {
    const response = await api.post(`/offerings/${businessId}`, data);
    return response.data;
  },

  update: async (id: string, data: OfferingRequest): Promise<Offering> => {
    const response = await api.put(`/offerings/update/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/offerings/${id}`);
  },
};

// ===== Schedule API =====
export const scheduleApi = {
  getSettings: async (businessId: string): Promise<ScheduleSettings> => {
    const response = await api.get(`/schedules/business/${businessId}`);
    return response.data;
  },

  updateSettings: async (businessId: string, data: ScheduleSettingsRequest): Promise<ScheduleSettings> => {
    const response = await api.put(`/schedules/business/${businessId}`, data);
    return response.data;
  },

  getBusyBlocks: async (
    businessId: string,
    viewStart: string,
    viewEnd: string
  ): Promise<BusyBlock[]> => {
    const response = await api.get(`/availabilities/busy-blocks/${businessId}`, {
      params: { start: viewStart, end: viewEnd },
    });
    return response.data;
  },
};

// ===== Reservations API =====
export const reservationsApi = {
  create: async (data: ReservationRequest): Promise<Reservation> => {
    const response = await api.post('/reservations/create', data);
    return response.data;
  },

  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations/mine');
    return response.data;
  },

  getByBusiness: async (businessId: string): Promise<Reservation[]> => {
    const response = await api.get(`/reservations/business/${businessId}`);
    return response.data;
  },

  cancel: async (id: string): Promise<void> => {
    await api.patch(`/reservations/${id}/cancel`);
  },

  confirm: async (id: string): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/confirm`);
    return response.data;
  },

  reject: async (id: string, reason?: string): Promise<Reservation> => {
    const response = await api.patch(`/reservations/${id}/reject`, { reason });
    return response.data;
  },
};

// ===== Reviews API =====
export const reviewsApi = {
  getByBusiness: async (businessId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/${businessId}`);
    return response.data;
  },

  create: async (businessId: string, rating: number, comment: string): Promise<Review> => {
    const response = await api.post(`/reviews/${businessId}`, { rating, comment });
    return response.data;
  },
};

// ===== Time Off API =====
export const timeOffApi = {
  getByBusiness: async (businessId: string): Promise<TimeOff[]> => {
    const response = await api.get(`/time-off/business/${businessId}`);
    return response.data;
  },

  create: async (businessId: string, data: TimeOffRequest): Promise<void> => {
    await api.post(`/time-off/business/${businessId}`, data);
  },

  delete: async (timeOffId: string): Promise<void> => {
    await api.delete(`/time-off/${timeOffId}`);
  },
};

// ===== File Upload API =====
export const fileApi = {
  uploadUserAvatar: async (file: File): Promise<{ path: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/files/user-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteUserAvatar: async (): Promise<void> => {
    await api.delete('/files/user-avatar');
  },

  uploadBusinessImage: async (businessId: string, file: File): Promise<{ path: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/files/business-image/${businessId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteBusinessImage: async (businessId: string): Promise<void> => {
    await api.delete(`/files/business-image/${businessId}`);
  },
};

// ===== Business Gallery API =====
export const galleryApi = {
  getPhotos: async (businessId: string): Promise<BusinessPhoto[]> => {
    const response = await api.get(`/files/business-photos/${businessId}`);
    return response.data;
  },

  uploadPhoto: async (businessId: string, file: File, caption?: string): Promise<BusinessPhoto> => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }
    const response = await api.post(`/files/business-photos/${businessId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePhoto: async (photoId: string): Promise<void> => {
    await api.delete(`/files/business-photos/${photoId}`);
  },

  updateCaption: async (photoId: string, caption: string): Promise<BusinessPhoto> => {
    const response = await api.patch(`/files/business-photos/${photoId}/caption`, { caption });
    return response.data;
  },
};

// ===== Notifications API =====
export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};

export default api;

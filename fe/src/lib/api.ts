import axios from 'axios';
import type {
  SignInRequest,
  UserRequest,
  AuthResponse,
  BusinessRequest,
  Business,
  OfferingRequest,
  Offering,
  ScheduleSettingsRequest,
  ScheduleSettings,
  BusyBlock,
  ReservationRequest,
  Reservation,
  Review,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
// Handle 401 responses - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ===== Auth API =====
export const authApi = {
  signIn: async (data: SignInForm): Promise<AuthResponse> => {
    const response = await api.post('/auth/signin', data);
    return response.data;
  },

  signUp: async (data: Omit<SignUpForm, "confirmPassword">): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
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
    const response = await api.put(`/businesses/${id}`, data);
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
    const response = await api.get(`/businesses/by-business-id/${businessId}`);
    return response.data;
  },

  create: async (businessId: string, data: OfferingRequest): Promise<Offering> => {
    const response = await api.post(`/offerings/${businessId}`, data);
    return response.data;
  },

  update: async (id: string, data: OfferingRequest): Promise<Offering> => {
    const response = await api.put(`/offerings/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/offerings/${id}`);
  },
};

// ===== Schedule API =====
export const scheduleApi = {
  getSettings: async (businessId: string): Promise<ScheduleSettings> => {
    const response = await api.get(`/schedules/${businessId}`);
    return response.data;
  },

  updateSettings: async (data: ScheduleSettingsRequest): Promise<ScheduleSettings> => {
    const response = await api.put('/schedules/settings', data);
    return response.data;
  },

  getBusyBlocks: async (
    businessId: string,
    viewStart: string,
    viewEnd: string
  ): Promise<BusyBlock[]> => {
    const response = await api.get('/schedules/busy-blocks', {
      params: { businessId, viewStart, viewEnd },
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

  cancel: async (id: string): Promise<Reservation> => {
    const response = await api.put(`/reservations/${id}/cancel`);
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

export default api;

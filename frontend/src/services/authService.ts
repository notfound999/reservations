import api from './api';

export interface LoginRequest {
  identifier: string; // 1. MATCH JAVA RECORD
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone: string; // 2. MATCH YOUR FORM/JAVA DTO (Usually 'phone' not 'phoneNumber')
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<any>('/auth/login', credentials);

    // SAFETY: Check if the token is inside an object or is the response itself
    const token = typeof response === 'string' ? response : response.token;

    if (token && token !== "undefined") {
      localStorage.setItem('token', token);
      // Only save user if it exists in the response
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } else {
      console.error("Login successful but NO TOKEN found in response:", response);
    }
    return response;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    // 5. ENSURE PATH MATCHES YOUR CONTROLLER
    const response = await api.post<AuthResponse>('/auth/signup', data);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token'); // 6. MATCH KEY
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: (): UserProfile | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token'); // 7. MATCH KEY
  },

  // 8. USE THE CORRECT PROFILE ENDPOINT
  getProfile: () => api.get<UserProfile>('/auth/me'),

  updateProfile: (data: Partial<UserProfile>) =>
      api.put<UserProfile>('/auth/me', data),
};

export default authService;
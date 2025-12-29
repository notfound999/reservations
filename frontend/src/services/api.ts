// Base API configuration - update this to your Spring Boot backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Helper function for making API requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // If the server says the token is invalid or expired
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token'); // Clear the bad token
      window.location.href = '/login';   // Force redirect to login
    }

    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),
  
  post: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'DELETE' }),
};

export default api;

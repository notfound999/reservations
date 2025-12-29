import api from './api';

export interface Reservation {
  id: string;
  businessId: string;
  serviceId: string;
  userId: string;
  startDateTime: string;
  endDateTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  // Populated fields
  businessName?: string;
  serviceName?: string;
  userName?: string;
}

export interface CreateReservationRequest {
  businessId: string;
  serviceId: string;
  startDateTime: string;
  endDateTime: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

export const reservationService = {
  // Get available time slots for a service on a specific date
  getAvailableSlots: (businessId: string, serviceId: string, date: string) =>
    api.get<AvailableSlot[]>(
      `/businesses/${businessId}/offerings/${serviceId}/slots?date=${date}`
    ),

  // Create a new reservation
  createReservation: (data: CreateReservationRequest) =>
    api.post<Reservation>('/reservations/create', data),

  // Get user's reservations
  getMyReservations: () => api.get<Reservation[]>('/reservations/mine'),

  // Get reservations for a business (admin only)
  getBusinessReservations: (businessId: string) =>
    api.get<Reservation[]>(`/businesses/${businessId}/reservations`),

  // Get single reservation
  getReservation: (id: string) => api.get<Reservation>(`/reservations/${id}`),

  // Cancel a reservation
  cancelReservation: (id: string) =>
    api.patch<Reservation>(`/reservations/${id}/cancel`, {}),

  // Confirm a reservation (admin only)
  confirmReservation: (id: string) =>
    api.patch<Reservation>(`/reservations/${id}/confirm`, {}),

  // Complete a reservation (admin only)
  completeReservation: (id: string) =>
    api.patch<Reservation>(`/reservations/${id}/complete`, {}),
};

export default reservationService;

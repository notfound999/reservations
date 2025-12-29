import api from './api';
import { Business, BusinessSchedule, Offering, TimeOff } from '@/types';

export interface CreateBusinessRequest {
  name: string;
  description: string;
  address: string;
  phone: string;
}

export interface UpdateScheduleRequest {
  reservationType: string;
  slotDurationValue: number;
  slotDurationUnit: 'MINUTES' | 'HOURS';
  minAdvanceBookingHours: number;
  maxAdvanceBookingDays: number;
  autoConfirmAppointments: boolean;
  workingDays: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
    isDayOff: boolean;
  }[];
}

export interface CreateOfferingRequest {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  bufferTimeMinutes: number;
  businessId: string;
}

export interface CreateTimeOffRequest {
  businessId: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
}

export interface BusinessAdmin {
  id: string;
  email: string;
  name: string;
  userId: string;
}

export const businessService = {
  // Get all public businesses
  getAllBusinesses: () => api.get<Business[]>('/businesses'),

  // Get businesses owned by current user
  getMyBusinesses: () => api.get<Business[]>('/me/businesses'),

  // Get single business by ID
  getBusiness: (id: string) => api.get<Business>(`/businesses/by-businessi-id/${id}`),

  // Create a new business
  createBusiness: (data: CreateBusinessRequest) => 
    api.post<Business>('/me/create/business', data),

  // Update a business
  updateBusiness: (id: string, data: Partial<CreateBusinessRequest>) => 
    api.put<Business>(`/businesses/update/${id}`, data),

  // Delete a business
  deleteBusiness: (id: string) => api.delete(`/${id}`),

  // Check if user is owner or admin
  checkPermission: (businessId: string) => 
    api.get<{ isOwner: boolean; isAdmin: boolean }>(`/businesses/${businessId}/permission`),

  // Schedule endpoints
  getSchedule: (businessId: string) => 
    api.get<BusinessSchedule>(`/schedules/business/${businessId}`),

  updateSchedule: (businessId: string, data: UpdateScheduleRequest) => 
    api.put<BusinessSchedule>(`/schedules/business/${businessId}`, data),

  // Offerings (Services) endpoints
  getOfferings: (businessId: string) => 
    api.get<Offering[]>(`/offerings/${businessId}`),

  createOffering: (businessId: string, data: Omit<CreateOfferingRequest, 'businessId'>) => 
    api.post<Offering>(`/offerings/${businessId}`, data),

  updateOffering: (businessId: string, offeringId: string, data: Partial<CreateOfferingRequest>) => 
    api.put<Offering>(`/offerings/${offeringId}`, data),

  deleteOffering: (businessId: string, offeringId: string) => 
    api.delete(`/offerings/${offeringId}`),

  // Time off endpoints
  getTimeOffs: (businessId: string) => 
    api.get<TimeOff[]>(`/time-off/business/${businessId}`),

  createTimeOff: (businessId: string, data: Omit<CreateTimeOffRequest, 'businessId'>) => 
    api.post<TimeOff>(`/time-off/business/${businessId}`, data),

  deleteTimeOff: (businessId: string, timeOffId: string) => 
    api.delete(`/time-off/${timeOffId}`),

  // Admin management
  getAdmins: (businessId: string) => 
    api.get<BusinessAdmin[]>(`/businesses/${businessId}/admins`),

  addAdmin: (businessId: string, email: string) => 
    api.post<BusinessAdmin>(`/businesses/${businessId}/admins`, { email }),

  removeAdmin: (businessId: string, adminId: string) => 
    api.delete(`/businesses/${businessId}/admins/${adminId}`),
};

export default businessService;

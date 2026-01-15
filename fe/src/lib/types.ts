// ===== Auth DTOs =====
export interface SignInRequest {
  identifier: string;
  password: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ===== Business DTOs =====
export type BusinessType =
  | 'SPA_WELLNESS'
  | 'BARBERSHOP'
  | 'BEAUTY_SALON'
  | 'FITNESS'
  | 'YOGA_MEDITATION'
  | 'PET_SERVICES'
  | 'OTHER';

export interface BusinessRequest {
  name: string;
  description: string;
  address: string;
  phone: string;
  businessType: BusinessType;
  customType?: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  imageUrl?: string;
  category?: string;
  businessType?: BusinessType;
  customType?: string;
  rating?: number;
  reviewCount?: number;
  ownerId: string;
}

export interface BusinessPhoto {
  id: string;
  url: string;
  caption?: string;
  displayOrder: number;
  createdAt: string;
}

// ===== Service/Offering DTOs =====
export interface OfferingRequest {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  bufferTimeMinutes: number;
}

export interface Offering {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  bufferTimeMinutes: number;
}

// ===== Schedule DTOs =====
export type ReservationType = 'SLOT' | 'RANGE';
export type ChronoUnit = 'MINUTES' | 'HOURS' | 'DAYS';

export interface WorkingDayRequest {
  dayOfWeek: string; // "MONDAY", "TUESDAY", etc.
  startTime: string; // "HH:mm" format
  endTime: string;   // "HH:mm" format
  breakStartTime?: string;
  breakEndTime?: string;
  isDayOff: boolean;
}

export interface ScheduleSettingsRequest {
  reservationType?: ReservationType;
  slotDurationValue?: number;
  slotDurationUnit?: ChronoUnit;
  minAdvanceBookingHours?: number;
  maxAdvanceBookingDays?: number;
  autoConfirmAppointments?: boolean;
  workingDays: WorkingDayRequest[];
}

export interface WorkingDay {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isDayOff: boolean;
}

export interface ScheduleSettings {
  id: string;
  reservationType: ReservationType;
  slotDurationValue: number;
  slotDurationUnit: ChronoUnit;
  minAdvanceBookingHours: number;
  maxAdvanceBookingDays: number;
  autoConfirmAppointments: boolean;
  workingDays: WorkingDay[];
}

// ===== Availability/Busy Blocks =====
export type BusyBlockType = 'OCCUPIED' | 'CLOSED';

export interface BusyBlock {
  start: string; // ISO datetime string
  end: string;   // ISO datetime string
  type: BusyBlockType;
}

// ===== Reservation DTOs =====
export interface ReservationRequest {
  businessId: string;
  offeringId: string;
  startTime: string; // ISO datetime string
  notes?: string;
}

export interface Reservation {
  id: string;
  businessId: string;
  businessName: string;
  offeringId: string;
  offeringName: string;
  userId: string;
  userName: string;
  startDateTime: string;
  endDateTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

// ===== Review DTOs =====
export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ===== Time Slot Types =====
export type SlotStatus = 'available' | 'occupied' | 'closed';

export interface TimeSlot {
  time: string; // "HH:mm" format
  datetime: string; // Full ISO datetime
  status: SlotStatus;
}

// ===== Time Off DTOs =====
export interface TimeOffRequest {
  startDateTime: string; // ISO datetime string
  endDateTime: string;   // ISO datetime string
  reason?: string;
}

export interface TimeOff {
  id: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
}

// ===== Calendar Event Types =====
export type CalendarEventType = 'reservation' | 'timeoff';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: CalendarEventType;
  // For reservations
  customerName?: string;
  serviceName?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  // For time-off
  reason?: string;
}

// ===== Notification DTOs =====
export type NotificationType = 'INFO' | 'SUCCESS' | 'ALERT' | 'WARNING';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  targetUrl?: string;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

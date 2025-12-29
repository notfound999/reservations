export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  ownerId: string;
  imageUrl?: string;
  createdAt: string;
}

export interface BusinessSchedule {
  id: string;
  businessId: string;
  reservationType: string;
  slotDurationValue: number;
  slotDurationUnit: 'MINUTES' | 'HOURS';
  minAdvanceBookingHours: number;
  maxAdvanceBookingDays: number;
  autoConfirmAppointments: boolean;
  workingDays: WorkingDay[];
}

export interface WorkingDay {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  isDayOff: boolean;
}

export interface TimeOff {
  id: string;
  businessId: string;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
}

export interface Offering {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  bufferTimeMinutes: number;
  businessId: string;
}

export interface Reservation {
  id: string;
  businessId: string;
  serviceId: string;
  userId: string;
  startDateTime: string;
  endDateTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

export interface BusinessAdmin {
  id: string;
  businessId: string;
  userId: string;
  user?: User;
}

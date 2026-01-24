import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { parseISO, startOfWeek, endOfWeek, isWithinInterval, differenceInMinutes, format } from 'date-fns';
import {
  Building2, Plus, Clock, DollarSign,
  Calendar, Settings, List, Loader2, Trash2, ChevronDown, Save, CalendarDays,
  Camera, Image, X, Upload, Check, AlertCircle, User
} from 'lucide-react';
import { SkeletonDashboard } from '@/components/ui/skeleton-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { businessApi, offeringsApi, scheduleApi, reservationsApi, timeOffApi, fileApi, galleryApi, getBaseUrl, extractErrorMessage } from '@/lib/api';
import type { Business, Offering, ScheduleSettings, WorkingDayRequest, Reservation, TimeOff, CalendarEvent, BusinessType, BusinessPhoto } from '@/lib/types';
import BusinessCalendar from '@/components/BusinessCalendar';
import TimeOffModal from '@/components/TimeOffModal';

const businessSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Phone number is required'),
  businessType: z.enum(['SPA_WELLNESS', 'BARBERSHOP', 'BEAUTY_SALON', 'FITNESS', 'YOGA_MEDITATION', 'PET_SERVICES', 'OTHER'], {
    required_error: 'Business type is required',
  }),
  customType: z.string().optional(),
}).refine((data) => {
  if (data.businessType === 'OTHER') {
    return data.customType && data.customType.length >= 2;
  }
  return true;
}, {
  message: 'Custom type is required when selecting Other (at least 2 characters)',
  path: ['customType'],
});

const offeringSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  durationMinutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes'),
  bufferTimeMinutes: z.coerce.number().min(0, 'Buffer time cannot be negative'),
});

type BusinessFormData = z.infer<typeof businessSchema>;
type OfferingFormData = z.infer<typeof offeringSchema>;

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings | null>(null);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const [isAddOfferingOpen, setIsAddOfferingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Working days form state
  const [workingDays, setWorkingDays] = useState<WorkingDayRequest[]>([]);
  const [scheduleFormData, setScheduleFormData] = useState({
    minAdvanceBookingHours: 2,
    maxAdvanceBookingDays: 30,
    autoConfirmAppointments: true,
  });

  // Business settings form state
  const [businessSettingsForm, setBusinessSettingsForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
  });

  // Calendar data state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);

  // Business image and gallery state
  const [businessImageUrl, setBusinessImageUrl] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<BusinessPhoto[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Reservation action state
  const [processingReservationId, setProcessingReservationId] = useState<string | null>(null);

  const businessForm = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: { name: '', description: '', address: '', phone: '', businessType: undefined, customType: '' },
  });

  const offeringForm = useForm<OfferingFormData>({
    resolver: zodResolver(offeringSchema),
    defaultValues: { name: '', description: '', price: 0, durationMinutes: 60, bufferTimeMinutes: 10 },
  });

  // Fetch user's businesses on mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setIsFetching(true);
        const data = await businessApi.getMyBusinesses();
        setBusinesses(data);
        if (data.length > 0) {
          setSelectedBusiness(data[0]);
        }
      } catch (err) {
        console.error('Error fetching businesses:', err);
      } finally {
        setIsFetching(false);
      }
    };

    if (isAuthenticated) {
      fetchBusinesses();
    }
  }, [isAuthenticated]);

  // Fetch offerings, schedule, reservations, and time-offs when selected business changes
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!selectedBusiness) {
        setOfferings([]);
        setScheduleSettings(null);
        setReservations([]);
        setTimeOffs([]);
        setBusinessImageUrl(null);
        setGalleryPhotos([]);
        return;
      }

      try {
        const [offeringsData, scheduleData, reservationsData, timeOffsData, photosData] = await Promise.all([
          offeringsApi.getByBusiness(selectedBusiness.id),
          scheduleApi.getSettings(selectedBusiness.id).catch(() => null),
          reservationsApi.getByBusiness(selectedBusiness.id).catch(() => []),
          timeOffApi.getByBusiness(selectedBusiness.id).catch(() => []),
          galleryApi.getPhotos(selectedBusiness.id).catch(() => []),
        ]);

        setOfferings(offeringsData);
        setScheduleSettings(scheduleData);
        setReservations(reservationsData);
        setTimeOffs(timeOffsData);
        setGalleryPhotos(photosData);

        // Set business image URL
        if (selectedBusiness.imageUrl) {
          setBusinessImageUrl(
            selectedBusiness.imageUrl.startsWith('http')
              ? selectedBusiness.imageUrl
              : `${getBaseUrl()}${selectedBusiness.imageUrl}`
          );
        } else {
          setBusinessImageUrl(null);
        }

        // Initialize working days form
        if (scheduleData?.workingDays) {
          setWorkingDays(scheduleData.workingDays.map(day => ({
            dayOfWeek: day.dayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime,
            breakStartTime: day.breakStartTime || '',
            breakEndTime: day.breakEndTime || '',
            isDayOff: day.isDayOff,
          })));
          setScheduleFormData({
            minAdvanceBookingHours: scheduleData.minAdvanceBookingHours,
            maxAdvanceBookingDays: scheduleData.maxAdvanceBookingDays,
            autoConfirmAppointments: scheduleData.autoConfirmAppointments,
          });
        } else {
          // Initialize default working days
          setWorkingDays(DAYS_OF_WEEK.map(day => ({
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            breakStartTime: '',
            breakEndTime: '',
            isDayOff: day === 'SATURDAY' || day === 'SUNDAY',
          })));
        }

        // Initialize business settings form
        setBusinessSettingsForm({
          name: selectedBusiness.name,
          description: selectedBusiness.description,
          address: selectedBusiness.address,
          phone: selectedBusiness.phone,
        });
      } catch (err) {
        console.error('Error fetching business data:', err);
        setOfferings([]);
      }
    };

    fetchBusinessData();
  }, [selectedBusiness]);

  const handleCreateBusiness = async (data: BusinessFormData) => {
    setIsLoading(true);
    try {
      const newBusiness = await businessApi.create({
        name: data.name,
        description: data.description,
        address: data.address,
        phone: data.phone,
        businessType: data.businessType,
        customType: data.businessType === 'OTHER' ? data.customType : undefined,
      });
      setBusinesses(prev => [...prev, newBusiness]);
      setSelectedBusiness(newBusiness);
      setIsAddBusinessOpen(false);
      businessForm.reset();

      toast({ title: 'Business created!', description: 'Your business has been listed.' });
    } catch (error: any) {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOffering = async (data: OfferingFormData) => {
    if (!selectedBusiness) return;

    setIsLoading(true);
    try {
      const newOffering = await offeringsApi.create(selectedBusiness.id, {
        name: data.name,
        description: data.description,
        price: data.price,
        durationMinutes: data.durationMinutes,
        bufferTimeMinutes: data.bufferTimeMinutes,
      });
      setOfferings(prev => [...prev, newOffering]);
      setIsAddOfferingOpen(false);
      offeringForm.reset();

      toast({ title: 'Service added!', description: 'Your new service is now available for booking.' });
    } catch (error: any) {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOffering = async (id: string) => {
    try {
      await offeringsApi.delete(id);
      setOfferings(prev => prev.filter(o => o.id !== id));
      toast({ title: 'Service deleted', description: 'The service has been removed.' });
    } catch (error: any) {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedBusiness) return;

    setIsSavingSchedule(true);
    try {
      await scheduleApi.updateSettings(selectedBusiness.id, {
        ...scheduleFormData,
        workingDays: workingDays,
      });
      toast({ title: 'Schedule saved!', description: 'Your schedule settings have been updated.' });
    } catch (error: any) {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSaveBusinessSettings = async () => {
    if (!selectedBusiness) return;

    setIsSavingSettings(true);
    try {
      const updated = await businessApi.update(selectedBusiness.id, {
        ...businessSettingsForm,
        businessType: selectedBusiness.businessType || 'OTHER',
        customType: selectedBusiness.customType,
      });
      setSelectedBusiness(updated);
      setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast({ title: 'Settings saved!', description: 'Your business settings have been updated.' });
    } catch (error: any) {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Business image handlers
  const handleBusinessImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedBusiness) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid file', description: 'Please upload a JPG, PNG, GIF, or WebP image', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be less than 5MB', variant: 'destructive' });
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await fileApi.uploadBusinessImage(selectedBusiness.id, file);
      setBusinessImageUrl(`${getBaseUrl()}${result.url}`);
      // Update the business in state
      setSelectedBusiness(prev => prev ? { ...prev, imageUrl: result.url } : null);
      setBusinesses(prev => prev.map(b => b.id === selectedBusiness.id ? { ...b, imageUrl: result.url } : b));
      toast({ title: 'Image uploaded', description: 'Your business profile picture has been updated.' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: extractErrorMessage(error), variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleBusinessImageDelete = async () => {
    if (!selectedBusiness || !businessImageUrl) return;

    setIsUploadingImage(true);
    try {
      await fileApi.deleteBusinessImage(selectedBusiness.id);
      setBusinessImageUrl(null);
      setSelectedBusiness(prev => prev ? { ...prev, imageUrl: undefined } : null);
      setBusinesses(prev => prev.map(b => b.id === selectedBusiness.id ? { ...b, imageUrl: undefined } : b));
      toast({ title: 'Image removed', description: 'Your business profile picture has been removed.' });
    } catch (error: any) {
      toast({ title: 'Delete failed', description: extractErrorMessage(error), variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Gallery handlers
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedBusiness) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    setIsUploadingGallery(true);
    try {
      for (const file of Array.from(files)) {
        if (!allowedTypes.includes(file.type)) {
          toast({ title: 'Skipped file', description: `${file.name} is not a valid image`, variant: 'destructive' });
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast({ title: 'Skipped file', description: `${file.name} is too large (max 5MB)`, variant: 'destructive' });
          continue;
        }

        const photo = await galleryApi.uploadPhoto(selectedBusiness.id, file);
        setGalleryPhotos(prev => [...prev, photo]);
      }
      toast({ title: 'Photos uploaded', description: 'Gallery photos have been added.' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.response?.data?.error || 'Could not upload photos', variant: 'destructive' });
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleGalleryPhotoDelete = async (photoId: string) => {
    try {
      await galleryApi.deletePhoto(photoId);
      setGalleryPhotos(prev => prev.filter(p => p.id !== photoId));
      toast({ title: 'Photo deleted', description: 'Gallery photo has been removed.' });
    } catch (error: any) {
      toast({ title: 'Delete failed', description: extractErrorMessage(error), variant: 'destructive' });
    }
  };

  const updateWorkingDay = (index: number, field: keyof WorkingDayRequest, value: string | boolean) => {
    setWorkingDays(prev => prev.map((day, i) =>
      i === index ? { ...day, [field]: value } : day
    ));
  };

  // Convert reservations and time-offs to calendar events
  const calendarEvents = useMemo((): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // Add reservations (exclude cancelled)
    reservations
      .filter(r => r.status !== 'CANCELLED')
      .forEach(reservation => {
        events.push({
          id: reservation.id,
          title: reservation.offeringName,
          start: parseISO(reservation.startDateTime),
          end: parseISO(reservation.endDateTime),
          type: 'reservation',
          customerName: reservation.userName,
          serviceName: reservation.offeringName,
          status: reservation.status,
        });
      });

    // Add time-offs
    timeOffs.forEach(timeOff => {
      events.push({
        id: timeOff.id,
        title: timeOff.reason || 'Time Off',
        start: parseISO(timeOff.startDateTime),
        end: parseISO(timeOff.endDateTime),
        type: 'timeoff',
        reason: timeOff.reason,
      });
    });

    return events;
  }, [reservations, timeOffs]);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

    // Filter reservations for this week (confirmed or pending, not cancelled)
    const thisWeekReservations = reservations.filter(r => {
      if (r.status === 'CANCELLED') return false;
      const startDate = parseISO(r.startDateTime);
      return isWithinInterval(startDate, { start: weekStart, end: weekEnd });
    });

    // Calculate total bookings
    const bookingsCount = thisWeekReservations.length;

    // Calculate total revenue (need to match offering prices)
    let totalRevenue = 0;
    let totalMinutes = 0;

    thisWeekReservations.forEach(reservation => {
      // Find the offering to get the price
      const offering = offerings.find(o => o.id === reservation.offeringId);
      if (offering) {
        totalRevenue += offering.price;
      }

      // Calculate duration
      const start = parseISO(reservation.startDateTime);
      const end = parseISO(reservation.endDateTime);
      totalMinutes += differenceInMinutes(end, start);
    });

    const totalHours = Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal

    return {
      bookingsCount,
      totalRevenue,
      totalHours,
    };
  }, [reservations, offerings]);

  // Filter pending reservations
  const pendingReservations = useMemo(() => {
    return reservations.filter(r => r.status === 'PENDING');
  }, [reservations]);

  // Handle confirm reservation
  const handleConfirmReservation = async (reservationId: string) => {
    setProcessingReservationId(reservationId);
    try {
      const updated = await reservationsApi.confirm(reservationId);
      setReservations(prev => prev.map(r => r.id === reservationId ? updated : r));
      toast({ title: 'Reservation confirmed!', description: 'The customer has been notified.' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not confirm reservation',
        variant: 'destructive'
      });
    } finally {
      setProcessingReservationId(null);
    }
  };

  // Handle reject reservation
  const handleRejectReservation = async (reservationId: string) => {
    setProcessingReservationId(reservationId);
    try {
      const updated = await reservationsApi.reject(reservationId);
      setReservations(prev => prev.map(r => r.id === reservationId ? updated : r));
      toast({ title: 'Reservation rejected', description: 'The customer has been notified.' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not reject reservation',
        variant: 'destructive'
      });
    } finally {
      setProcessingReservationId(null);
    }
  };

  const handleAddTimeOff = async (data: {
    startDateTime: string;
    endDateTime: string;
    reason?: string;
  }) => {
    if (!selectedBusiness) return;

    await timeOffApi.create(selectedBusiness.id, data);
    // Refresh time-offs
    const updatedTimeOffs = await timeOffApi.getByBusiness(selectedBusiness.id);
    setTimeOffs(updatedTimeOffs);
    toast({ title: 'Time off added!', description: 'Your schedule has been updated.' });
  };

  const handleDeleteTimeOff = async (timeOffId: string) => {
    if (!selectedBusiness) return;

    try {
      await timeOffApi.delete(timeOffId);
      setTimeOffs(prev => prev.filter(t => t.id !== timeOffId));
      toast({ title: 'Time off removed', description: 'The time off has been deleted.' });
    } catch (error: any) {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen py-4 md:py-8">
        <div className="container px-4">
          <div className="mb-6 md:mb-8">
            <div className="h-8 w-48 bg-muted animate-shimmer rounded-md mb-2" />
            <div className="h-4 w-64 bg-muted animate-shimmer rounded-md" />
          </div>
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="container px-4">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Business Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your businesses, services, and bookings
            </p>
          </div>

          {/* Business Selector and Add Button */}
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            {businesses.length > 0 && (
              <Select
                value={selectedBusiness?.id}
                onValueChange={(id) => setSelectedBusiness(businesses.find(b => b.id === id) || null)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Dialog open={isAddBusinessOpen} onOpenChange={setIsAddBusinessOpen}>
              <DialogTrigger asChild>
                <Button className="flex-shrink-0">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Business</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Business</DialogTitle>
                </DialogHeader>
                <form onSubmit={businessForm.handleSubmit(handleCreateBusiness)} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Business Name</Label>
                    <Input id="name" {...businessForm.register('name')} className="h-11" />
                    {businessForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{businessForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" {...businessForm.register('description')} rows={3} />
                    {businessForm.formState.errors.description && (
                      <p className="text-sm text-destructive">{businessForm.formState.errors.description.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" {...businessForm.register('address')} className="h-11" />
                    {businessForm.formState.errors.address && (
                      <p className="text-sm text-destructive">{businessForm.formState.errors.address.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...businessForm.register('phone')} className="h-11" />
                    {businessForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">{businessForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      onValueChange={(value) => businessForm.setValue('businessType', value as BusinessType)}
                      value={businessForm.watch('businessType')}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SPA_WELLNESS">Spa & Wellness</SelectItem>
                        <SelectItem value="BARBERSHOP">Barbershop</SelectItem>
                        <SelectItem value="BEAUTY_SALON">Beauty Salon</SelectItem>
                        <SelectItem value="FITNESS">Fitness</SelectItem>
                        <SelectItem value="YOGA_MEDITATION">Yoga & Meditation</SelectItem>
                        <SelectItem value="PET_SERVICES">Pet Services</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {businessForm.formState.errors.businessType && (
                      <p className="text-sm text-destructive">{businessForm.formState.errors.businessType.message}</p>
                    )}
                  </div>
                  {businessForm.watch('businessType') === 'OTHER' && (
                    <div className="space-y-2">
                      <Label htmlFor="customType">Custom Type</Label>
                      <Input
                        id="customType"
                        {...businessForm.register('customType')}
                        className="h-11"
                        placeholder="Enter your business type"
                      />
                      {businessForm.formState.errors.customType && (
                        <p className="text-sm text-destructive">{businessForm.formState.errors.customType.message}</p>
                      )}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Business
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {businesses.length === 0 ? (
          <Card className="text-center py-12 md:py-16">
            <CardContent className="p-4 md:p-6">
              <Building2 className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg md:text-xl font-semibold mb-2">No businesses yet</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Create your first business to start accepting bookings
              </p>
              <Dialog open={isAddBusinessOpen} onOpenChange={setIsAddBusinessOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Business
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="calendar" className="space-y-4 md:space-y-6">
            <TabsList className="bg-secondary/50 w-full sm:w-auto overflow-x-auto flex-nowrap justify-start">
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                My Schedule
              </TabsTrigger>
              <TabsTrigger value="overview" className="gap-2">
                <Building2 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2">
                <List className="h-4 w-4" />
                My Services
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2">
                <Calendar className="h-4 w-4" />
                Working Hours
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Calendar/My Schedule Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <BusinessCalendar
                events={calendarEvents}
                workingDays={scheduleSettings?.workingDays}
                onAddTimeOff={() => setIsTimeOffModalOpen(true)}
                onDeleteTimeOff={handleDeleteTimeOff}
              />
              <TimeOffModal
                open={isTimeOffModalOpen}
                onOpenChange={setIsTimeOffModalOpen}
                onSubmit={handleAddTimeOff}
              />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{weeklyStats.bookingsCount}</p>
                        <p className="text-sm text-muted-foreground">Bookings this week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">${weeklyStats.totalRevenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Revenue this week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                        <Clock className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{weeklyStats.totalHours}h</p>
                        <p className="text-sm text-muted-foreground">Hours booked</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={pendingReservations.length > 0 ? 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${pendingReservations.length > 0 ? 'bg-yellow-500/20' : 'bg-muted'}`}>
                        <AlertCircle className={`h-6 w-6 ${pendingReservations.length > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{pendingReservations.length}</p>
                        <p className="text-sm text-muted-foreground">Pending approval</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Reservations Section */}
              {pendingReservations.length > 0 && (
                <Card className="border-yellow-500/50">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      Pending Reservations
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      These reservations require your approval
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="space-y-3">
                      {pendingReservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-secondary/30 border"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{reservation.userName}</p>
                              <p className="text-sm text-muted-foreground">{reservation.offeringName}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(parseISO(reservation.startDateTime), 'EEE, MMM d, yyyy \'at\' h:mm a')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleRejectReservation(reservation.id)}
                              disabled={processingReservationId === reservation.id}
                            >
                              {processingReservationId === reservation.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                              onClick={() => handleConfirmReservation(reservation.id)}
                              disabled={processingReservationId === reservation.id}
                            >
                              {processingReservationId === reservation.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Confirm
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">Business Information</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Your active business listing</CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  {selectedBusiness && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground text-xs md:text-sm">Name</Label>
                        <p className="font-medium text-sm md:text-base">{selectedBusiness.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs md:text-sm">Description</Label>
                        <p className="text-sm md:text-base">{selectedBusiness.description}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground text-xs md:text-sm">Address</Label>
                          <p className="text-sm md:text-base">{selectedBusiness.address}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs md:text-sm">Phone</Label>
                          <p className="text-sm md:text-base">{selectedBusiness.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold">Services</h2>
                  <p className="text-sm md:text-base text-muted-foreground">{offerings.length} services listed</p>
                </div>
                <Dialog open={isAddOfferingOpen} onOpenChange={setIsAddOfferingOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Service</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={offeringForm.handleSubmit(handleCreateOffering)} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="serviceName">Service Name</Label>
                        <Input id="serviceName" {...offeringForm.register('name')} className="h-11" />
                        {offeringForm.formState.errors.name && (
                          <p className="text-sm text-destructive">{offeringForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceDescription">Description</Label>
                        <Textarea id="serviceDescription" {...offeringForm.register('description')} rows={3} />
                        {offeringForm.formState.errors.description && (
                          <p className="text-sm text-destructive">{offeringForm.formState.errors.description.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price ($)</Label>
                          <Input id="price" type="number" step="0.01" {...offeringForm.register('price')} className="h-11" />
                          {offeringForm.formState.errors.price && (
                            <p className="text-sm text-destructive">{offeringForm.formState.errors.price.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (min)</Label>
                          <Input id="duration" type="number" {...offeringForm.register('durationMinutes')} className="h-11" />
                          {offeringForm.formState.errors.durationMinutes && (
                            <p className="text-sm text-destructive">{offeringForm.formState.errors.durationMinutes.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buffer">Buffer Time (min)</Label>
                        <Input id="buffer" type="number" {...offeringForm.register('bufferTimeMinutes')} className="h-11" />
                        <p className="text-xs text-muted-foreground">Time between appointments for preparation</p>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Service
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {offerings.length > 0 ? (
                  offerings.map((offering) => (
                    <Card key={offering.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">{offering.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{offering.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{offering.durationMinutes} min</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">${offering.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteOffering(offering.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No services yet. Add your first service to start accepting bookings.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">Schedule Settings</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Configure your business hours and booking preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                  {/* Booking Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minAdvance">Minimum Advance Booking (hours)</Label>
                      <Input
                        id="minAdvance"
                        type="number"
                        value={scheduleFormData.minAdvanceBookingHours}
                        onChange={(e) => setScheduleFormData(prev => ({
                          ...prev,
                          minAdvanceBookingHours: parseInt(e.target.value) || 0
                        }))}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAdvance">Maximum Advance Booking (days)</Label>
                      <Input
                        id="maxAdvance"
                        type="number"
                        value={scheduleFormData.maxAdvanceBookingDays}
                        onChange={(e) => setScheduleFormData(prev => ({
                          ...prev,
                          maxAdvanceBookingDays: parseInt(e.target.value) || 1
                        }))}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Auto-confirm Appointments</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch
                          checked={scheduleFormData.autoConfirmAppointments}
                          onCheckedChange={(checked) => setScheduleFormData(prev => ({
                            ...prev,
                            autoConfirmAppointments: checked
                          }))}
                        />
                        <span className="text-sm text-muted-foreground">
                          {scheduleFormData.autoConfirmAppointments ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div>
                    <h3 className="font-medium mb-4 text-sm md:text-base">Working Hours</h3>
                    <div className="space-y-3">
                      {workingDays.map((day, index) => (
                        <div key={day.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-lg bg-secondary/30">
                          <div className="w-full sm:w-28 flex items-center justify-between sm:justify-start">
                            <span className="font-medium text-sm md:text-base">{DAY_LABELS[day.dayOfWeek]}</span>
                            <div className="flex items-center gap-2 sm:hidden">
                              <Switch
                                checked={!day.isDayOff}
                                onCheckedChange={(checked) => updateWorkingDay(index, 'isDayOff', !checked)}
                              />
                              <span className="text-xs text-muted-foreground w-14">
                                {day.isDayOff ? 'Closed' : 'Open'}
                              </span>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-2">
                            <Switch
                              checked={!day.isDayOff}
                              onCheckedChange={(checked) => updateWorkingDay(index, 'isDayOff', !checked)}
                            />
                            <span className="text-sm text-muted-foreground w-14">
                              {day.isDayOff ? 'Closed' : 'Open'}
                            </span>
                          </div>
                          {!day.isDayOff && (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="time"
                                value={day.startTime}
                                onChange={(e) => updateWorkingDay(index, 'startTime', e.target.value)}
                                className="w-full sm:w-32 text-sm"
                              />
                              <span className="text-muted-foreground text-xs md:text-sm">to</span>
                              <Input
                                type="time"
                                value={day.endTime}
                                onChange={(e) => updateWorkingDay(index, 'endTime', e.target.value)}
                                className="w-full sm:w-32 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSaveSchedule} disabled={isSavingSchedule}>
                    {isSavingSchedule ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Schedule
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">Business Settings</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Update your business information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-6">
                  <div className="space-y-2">
                    <Label htmlFor="settingsName">Business Name</Label>
                    <Input
                      id="settingsName"
                      value={businessSettingsForm.name}
                      onChange={(e) => setBusinessSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settingsDescription">Description</Label>
                    <Textarea
                      id="settingsDescription"
                      value={businessSettingsForm.description}
                      onChange={(e) => setBusinessSettingsForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="settingsAddress">Address</Label>
                      <Input
                        id="settingsAddress"
                        value={businessSettingsForm.address}
                        onChange={(e) => setBusinessSettingsForm(prev => ({ ...prev, address: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settingsPhone">Phone</Label>
                      <Input
                        id="settingsPhone"
                        value={businessSettingsForm.phone}
                        onChange={(e) => setBusinessSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveBusinessSettings} disabled={isSavingSettings} className="w-full sm:w-auto">
                    {isSavingSettings ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Business Profile Picture */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Profile Picture
                  </CardTitle>
                  <CardDescription>
                    This image will be displayed on your business card and profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-6">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted/50 flex items-center justify-center">
                        {businessImageUrl ? (
                          <img
                            src={businessImageUrl}
                            alt="Business"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-12 w-12 text-muted-foreground/50" />
                        )}
                      </div>
                      {businessImageUrl && (
                        <button
                          onClick={handleBusinessImageDelete}
                          disabled={isUploadingImage}
                          className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Upload a profile picture for your business. Recommended size: 400x400 pixels.
                      </p>
                      <div>
                        <input
                          type="file"
                          id="business-image-upload"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={handleBusinessImageUpload}
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('business-image-upload')?.click()}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          {businessImageUrl ? 'Change Picture' : 'Upload Picture'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photo Gallery */}
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Image className="h-5 w-5" />
                    Photo Gallery
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Add photos of your work, ambient, or services (max 20 photos)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-6">
                  {/* Gallery Grid */}
                  {galleryPhotos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                      {galleryPhotos.map((photo) => (
                        <div key={photo.id} className="relative group aspect-square">
                          <img
                            src={photo.url.startsWith('http') ? photo.url : `${getBaseUrl()}${photo.url}`}
                            alt={photo.caption || 'Gallery photo'}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleGalleryPhotoDelete(photo.id)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
                              <p className="text-xs text-white truncate">{photo.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="gallery-upload"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />
                    <Image className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      {galleryPhotos.length}/20 photos uploaded
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('gallery-upload')?.click()}
                      disabled={isUploadingGallery || galleryPhotos.length >= 20}
                    >
                      {isUploadingGallery ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Add Photos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { format, addDays, isSameDay, startOfDay, parse, addMinutes, isBefore, endOfDay, formatISO } from 'date-fns';
import { Clock } from 'lucide-react';
import { SkeletonTimeSlots } from '@/components/ui/skeleton-loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { scheduleApi, reservationsApi } from '@/lib/api';
import type { Offering, BusyBlock, TimeSlot, SlotStatus } from '@/lib/types';
import AuthModal from './AuthModal';
import BookingSuccessModal from './BookingSuccessModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBookingDraft } from '@/hooks/use-booking-draft';
import { useDebounce } from '@/hooks/use-debounce';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offering: Offering | null;
  businessName: string;
  businessId: string;
}

// Generate time slots for a day
const generateTimeSlots = (
  date: Date,
  durationMinutes: number,
  busyBlocks: BusyBlock[],
  workStart = '09:00',
  workEnd = '18:00'
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dayStart = parse(workStart, 'HH:mm', date);
  const dayEnd = parse(workEnd, 'HH:mm', date);

  // Use 10-minute increments for start times
  const INCREMENT_MINUTES = 10;

  let current = dayStart;

  while (isBefore(current, dayEnd)) {
    const slotEnd = addMinutes(current, durationMinutes);

    // Skip if the service would extend beyond working hours
    if (!isBefore(slotEnd, dayEnd) && slotEnd.getTime() !== dayEnd.getTime()) {
      current = addMinutes(current, INCREMENT_MINUTES);
      continue;
    }

    // Format as local datetime (no timezone) for backend LocalDateTime parsing
    const slotDateTime = format(current, "yyyy-MM-dd'T'HH:mm:ss");

    // Check against busy blocks using interval overlap logic
    // Overlap if: (startA < endB) AND (endA > startB)
    let status: SlotStatus = 'available';

    for (const block of busyBlocks) {
      // Parse block times as local dates (backend sends LocalDateTime without timezone)
      const blockStart = parse(block.start, "yyyy-MM-dd'T'HH:mm:ss", new Date());
      const blockEnd = parse(block.end, "yyyy-MM-dd'T'HH:mm:ss", new Date());

      // Check if [current, slotEnd] overlaps with [blockStart, blockEnd]
      // Overlap condition: current < blockEnd AND slotEnd > blockStart
      if (current < blockEnd && slotEnd > blockStart) {
        status = block.type === 'CLOSED' ? 'closed' : 'occupied';
        break;
      }
    }

    // Check if slot is in the past
    if (isBefore(current, new Date())) {
      status = 'closed';
    }

    slots.push({
      time: format(current, 'HH:mm'),
      datetime: slotDateTime,
      status,
    });

    current = addMinutes(current, INCREMENT_MINUTES);
  }

  return slots;
};

const BookingModal = ({ open, onOpenChange, offering, businessName, businessId }: BookingModalProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [step, setStep] = useState<'info' | 'datetime' | 'auth' | 'confirm'>('info');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [busyBlocks, setBusyBlocks] = useState<BusyBlock[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Draft saving hook
  const { hasDraft, saveDraft, clearDraft, restoreDraft } = useBookingDraft(
    businessId,
    offering?.id || ''
  );

  // Generate dates for the next 14 days
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  // Fetch busy blocks when date changes
  useEffect(() => {
    const fetchBusyBlocks = async () => {
      if (!open || step !== 'datetime') return;
      
      try {
        setIsFetchingSlots(true);
        const viewStart = startOfDay(selectedDate).toISOString();
        const viewEnd = endOfDay(selectedDate).toISOString();
        const blocks = await scheduleApi.getBusyBlocks(businessId, viewStart, viewEnd);
        setBusyBlocks(blocks);
      } catch (err) {
        console.error('Error fetching busy blocks:', err);
        setBusyBlocks([]);
      } finally {
        setIsFetchingSlots(false);
      }
    };

    fetchBusyBlocks();
  }, [businessId, selectedDate, open, step]);
  
  // Restore draft when modal opens
  useEffect(() => {
    if (open && hasDraft && !draftRestored && offering) {
      const draft = restoreDraft();
      if (draft) {
        toast({
          title: 'Continue where you left off?',
          description: 'We found your previous booking attempt.',
          action: {
            label: 'Restore',
            onClick: () => {
              try {
                setSelectedDate(new Date(draft.selectedDate));
                setSelectedSlot(draft.selectedSlot);
                setNotes(draft.notes);
                setStep('datetime');
                setDraftRestored(true);
                toast({
                  title: 'Draft restored',
                  description: 'Your previous selection has been restored.',
                });
              } catch (error) {
                console.error('Failed to restore draft:', error);
              }
            },
          },
        });
      }
    }
  }, [open, hasDraft, draftRestored, offering, restoreDraft, toast]);

  // Save draft when state changes (debounced)
  const debouncedDate = useDebounce(selectedDate, 500);
  const debouncedSlot = useDebounce(selectedSlot, 500);
  const debouncedNotes = useDebounce(notes, 500);

  useEffect(() => {
    if (open && offering && step !== 'info') {
      saveDraft({
        selectedDate: debouncedDate.toISOString(),
        selectedSlot: debouncedSlot,
        notes: debouncedNotes,
      });
    }
  }, [debouncedDate, debouncedSlot, debouncedNotes, open, offering, step, saveDraft]);

  // Generate time slots for selected date
  const timeSlots = offering
    ? generateTimeSlots(selectedDate, offering.durationMinutes, busyBlocks)
    : [];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
    }
  };

  const handleContinue = () => {
    if (step === 'info') {
      setStep('datetime');
    } else if (step === 'datetime' && selectedSlot) {
      if (!isAuthenticated) {
        setShowAuthModal(true);
      } else {
        setStep('confirm');
      }
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setStep('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!offering || !selectedSlot) return;

    setIsLoading(true);
    try {
      await reservationsApi.create({
        businessId,
        offeringId: offering.id,
        startTime: selectedSlot.datetime,
        notes: notes || undefined,
      });

      // Clear draft on successful booking
      clearDraft();

      // Close booking modal and show success modal
      onOpenChange(false);
      setShowSuccessModal(true);

      // Reset booking modal for next time
      setTimeout(() => resetModal(), 300);
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep('info');
    setSelectedDate(startOfDay(new Date()));
    setSelectedSlot(null);
    setNotes('');
    setBusyBlocks([]);
    setDraftRestored(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetModal();
  };

  if (!offering) return null;

  // Shared content component
  const modalContent = (
    <>
      {/* Step 1: Service Info */}
      {step === 'info' && (
        <div className="space-y-6 mt-4">
          <div className="bg-accent/50 rounded-xl p-4">
            <h3 className="font-semibold text-lg mb-1">{offering.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{offering.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{offering.durationMinutes} min</span>
              </div>
              <div className="font-semibold text-primary text-lg">
                ${offering.price.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">At {businessName}</p>
            <p>Select your preferred date and time in the next step.</p>
          </div>

          <Button onClick={handleContinue} className="w-full" size="lg">
            Select Date & Time
          </Button>
        </div>
      )}

      {/* Step 2: Date & Time Selection */}
      {step === 'datetime' && (
        <div className="flex flex-col min-h-0 flex-1">
          {/* Sticky Date Picker */}
          <div className="flex-shrink-0 sticky top-0 bg-background z-10 pb-3 border-b md:border-b-0 md:pb-4">
            <Label className="text-xs font-bold mb-2 block uppercase tracking-wide text-muted-foreground">
              Select Date
            </Label>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-2 -mx-2 px-2">
              {availableDates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    "flex flex-col items-center min-w-[4rem] p-2.5 rounded-lg border transition-all flex-shrink-0",
                    isSameDay(date, selectedDate)
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card hover:bg-accent border-border"
                  )}
                >
                  <span className="text-xs font-medium opacity-80">
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-lg font-semibold">
                    {format(date, 'd')}
                  </span>
                  <span className="text-xs opacity-80">
                    {format(date, 'MMM')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Time Slots */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent md:mt-4 min-h-0">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Available Times for {format(selectedDate, 'MMM d')}
              </Label>

              {isFetchingSlots ? (
                <SkeletonTimeSlots />
              ) : (
                <>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 pb-4">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={slot.status !== 'available'}
                        className={cn(
                          "p-2 rounded-md text-sm font-medium transition-all",
                          slot.status === 'available' && selectedSlot?.time === slot.time
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : slot.status === 'available'
                            ? "bg-card border border-border hover:bg-accent hover:border-primary"
                            : slot.status === 'occupied'
                            ? "bg-destructive/10 text-destructive line-through cursor-not-allowed opacity-60"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-3 pb-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-card border" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-destructive/20" />
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-muted" />
                      <span>Closed</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons - Always visible at bottom */}
          <div className="flex gap-3 pt-4 border-t bg-background flex-shrink-0">
            <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedSlot}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && selectedSlot && (
        <div className="space-y-6 mt-4">
          <div className="bg-accent/50 rounded-xl p-4 space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Service</span>
              <p className="font-medium">{offering.name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Date & Time</span>
              <p className="font-medium">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedSlot.time}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Duration</span>
              <p className="font-medium">{offering.durationMinutes} minutes</p>
            </div>
            <div className="pt-2 border-t">
              <span className="text-sm text-muted-foreground">Total</span>
              <p className="font-semibold text-xl text-primary">${offering.price.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('datetime')} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={isLoading}
              className="flex-1"
              variant="hero"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </>
  );

  const title = step === 'info' ? 'Book Service' : step === 'datetime' ? 'Select Date & Time' : 'Confirm Booking';

  return (
    <>
      {/* Mobile: Use Drawer */}
      {isMobile ? (
        <Drawer open={open} onOpenChange={handleClose}>
          <DrawerContent className="max-h-[90vh] px-4 pb-4">
            <DrawerHeader className="px-0">
              <DrawerTitle className="text-xl">{title}</DrawerTitle>
            </DrawerHeader>
            <div className={cn(
              "overflow-hidden flex flex-col",
              step === 'datetime' ? "h-[calc(90vh-120px)]" : "h-auto"
            )}>
              {modalContent}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        /* Desktop: Use Dialog */
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className={cn(
            "sm:max-w-2xl",
            step === 'datetime' ? "max-h-[85vh] flex flex-col p-0" : "max-h-[90vh]"
          )}>
            {step === 'datetime' ? (
              /* Special layout for datetime step on desktop */
              <>
                <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
                  <DialogTitle className="text-xl">{title}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
                  {modalContent}
                </div>
              </>
            ) : (
              /* Normal layout for other steps */
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{title}</DialogTitle>
                </DialogHeader>
                {modalContent}
              </>
            )}
          </DialogContent>
        </Dialog>
      )}

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />

      <BookingSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        offering={offering}
        businessName={businessName}
        selectedDate={selectedDate}
        selectedTime={selectedSlot?.time || ''}
      />
    </>
  );
};

export default BookingModal;
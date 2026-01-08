import { useState, useEffect } from 'react';
import { format, addDays, isSameDay, startOfDay, parse, addMinutes, isBefore, endOfDay } from 'date-fns';
import { Clock, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { scheduleApi, reservationsApi } from '@/lib/api';
import type { Offering, BusyBlock, TimeSlot, SlotStatus } from '@/lib/types';
import AuthModal from './AuthModal';

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
  
  let current = dayStart;
  
  while (isBefore(current, dayEnd)) {
    const slotEnd = addMinutes(current, durationMinutes);
    const slotDateTime = current.toISOString();
    
    // Check against busy blocks
    let status: SlotStatus = 'available';
    
    for (const block of busyBlocks) {
      const blockStart = new Date(block.start);
      const blockEnd = new Date(block.end);
      
      // Check if slot overlaps with block
      if (
        (current >= blockStart && current < blockEnd) ||
        (slotEnd > blockStart && slotEnd <= blockEnd) ||
        (current <= blockStart && slotEnd >= blockEnd)
      ) {
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
    
    current = addMinutes(current, 30); // 30-min intervals
  }
  
  return slots;
};

const BookingModal = ({ open, onOpenChange, offering, businessName, businessId }: BookingModalProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'info' | 'datetime' | 'auth' | 'confirm'>('info');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [busyBlocks, setBusyBlocks] = useState<BusyBlock[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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
      
      toast({
        title: 'Booking Confirmed!',
        description: `Your appointment for ${offering.name} has been booked.`,
      });
      
      onOpenChange(false);
      resetModal();
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
  };

  const handleClose = () => {
    onOpenChange(false);
    resetModal();
  };

  if (!offering) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {step === 'info' && 'Book Service'}
              {step === 'datetime' && 'Select Date & Time'}
              {step === 'confirm' && 'Confirm Booking'}
            </DialogTitle>
          </DialogHeader>

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
            <div className="space-y-6 mt-4">
              {/* Date Picker */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Select Date</Label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                  {availableDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      className={cn(
                        "flex flex-col items-center min-w-[4.5rem] p-3 rounded-xl border transition-all",
                        isSameDay(date, selectedDate)
                          ? "bg-primary text-primary-foreground border-primary shadow-warm"
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

              {/* Time Slots */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Available Times for {format(selectedDate, 'EEEE, MMMM d')}
                </Label>
                {isFetchingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={slot.status !== 'available'}
                        className={cn(
                          "p-2.5 rounded-lg text-sm font-medium transition-all",
                          slot.status === 'available' && selectedSlot?.time === slot.time
                            ? "bg-primary text-primary-foreground shadow-warm"
                            : slot.status === 'available'
                            ? "bg-card border border-border hover:bg-accent hover:border-primary"
                            : slot.status === 'occupied'
                            ? "bg-destructive/10 text-destructive line-through cursor-not-allowed"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-card border" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-destructive/20" />
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-muted" />
                    <span>Closed</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
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
        </DialogContent>
      </Dialog>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default BookingModal;
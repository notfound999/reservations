import { useState, useEffect } from 'react';
import { startOfDay } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { reservationsApi } from '@/lib/api';
import type { Offering, TimeSlot } from '@/lib/types';
import BookingHeader from './booking-steps/BookingHeader';
import BookingProgress from './booking-steps/BookingProgress';
import ServiceInfoStep from './booking-steps/ServiceInfoStep';
import DateTimeStep from './booking-steps/DateTimeStep';
import ConfirmStep from './booking-steps/ConfirmStep';
import BookingStickyFooter from './booking-steps/BookingStickyFooter';
import AuthModal from './AuthModal';

interface BookingFlowFullScreenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offering: Offering | null;
  businessName: string;
  businessId: string;
}

type Step = 'info' | 'datetime' | 'confirm';

const BookingFlowFullScreen = ({
  open,
  onOpenChange,
  offering,
  businessName,
  businessId
}: BookingFlowFullScreenProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('info');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleBack = () => {
    if (step === 'datetime') {
      setStep('info');
    } else if (step === 'confirm') {
      setStep('datetime');
    }
  };

  const handleClose = () => {
    setStep('info');
    setSelectedDate(startOfDay(new Date()));
    setSelectedSlot(null);
    setNotes('');
    onOpenChange(false);
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
        description: 'Your reservation has been created. Check notifications for details.',
      });

      handleClose();
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

  if (!open || !offering) return null;

  const stepNumber = step === 'info' ? 1 : step === 'datetime' ? 2 : 3;
  const totalSteps = 3;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-background flex flex-col overflow-hidden">
        <BookingHeader
          currentStep={stepNumber}
          totalSteps={totalSteps}
          onBack={handleBack}
          onClose={handleClose}
          canGoBack={step !== 'info'}
        />

        <BookingProgress currentStep={stepNumber} totalSteps={totalSteps} />

        <div className="flex-1 overflow-hidden">
          <div className="h-full">
            {step === 'info' && (
              <ServiceInfoStep offering={offering} businessName={businessName} />
            )}

            {step === 'datetime' && (
              <DateTimeStep
                businessId={businessId}
                durationMinutes={offering.durationMinutes}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onDateSelect={setSelectedDate}
                onSlotSelect={setSelectedSlot}
              />
            )}

            {step === 'confirm' && selectedSlot && (
              <ConfirmStep
                offering={offering}
                businessName={businessName}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                notes={notes}
                onNotesChange={setNotes}
                onEditDateTime={() => setStep('datetime')}
              />
            )}
          </div>
        </div>

        <BookingStickyFooter
          onBack={step !== 'info' ? handleBack : undefined}
          onContinue={step === 'confirm' ? handleConfirmBooking : handleContinue}
          continueLabel={step === 'confirm' ? 'Confirm Booking' : 'Continue'}
          continueDisabled={step === 'datetime' && !selectedSlot}
          isLoading={isLoading}
          showBack={step !== 'info'}
        />
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default BookingFlowFullScreen;

import { useState, useEffect } from 'react';
import { startOfDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
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
import BookingSuccessModal from './BookingSuccessModal';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    date: Date;
    time: string;
  } | null>(null);

  // Disable body scroll when modal is open
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
    // Reset state
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

      // Save booking details before resetting
      setConfirmedBooking({
        date: selectedDate,
        time: selectedSlot.time,
      });

      // Close booking flow and show success modal
      handleClose();
      setShowSuccessModal(true);
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

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <BookingHeader
          currentStep={stepNumber}
          totalSteps={totalSteps}
          onBack={handleBack}
          onClose={handleClose}
          canGoBack={step !== 'info'}
        />

        {/* Progress Bar */}
        <BookingProgress currentStep={stepNumber} totalSteps={totalSteps} />

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="h-full"
            >
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <BookingStickyFooter
          onBack={step !== 'info' ? handleBack : undefined}
          onContinue={step === 'confirm' ? handleConfirmBooking : handleContinue}
          continueLabel={step === 'confirm' ? 'Confirm Booking' : 'Continue'}
          continueDisabled={step === 'datetime' && !selectedSlot}
          isLoading={isLoading}
          showBack={step !== 'info'}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />

      {/* Success Modal */}
      <BookingSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        offering={offering}
        businessName={businessName}
        selectedDate={confirmedBooking?.date || new Date()}
        selectedTime={confirmedBooking?.time || ''}
      />
    </>
  );
};

export default BookingFlowFullScreen;

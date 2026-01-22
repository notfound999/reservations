import { ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onClose: () => void;
  canGoBack: boolean;
}

const BookingHeader = ({ currentStep, totalSteps, onBack, onClose, canGoBack }: BookingHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 bg-background border-b h-14 flex items-center justify-between px-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        disabled={!canGoBack}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Step Indicator */}
      <div className="text-sm font-medium text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-9 w-9"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default BookingHeader;

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingStickyFooterProps {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  isLoading?: boolean;
  showBack?: boolean;
}

const BookingStickyFooter = ({
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  isLoading = false,
  showBack = true
}: BookingStickyFooterProps) => {
  return (
    <div className="flex-shrink-0 bg-background border-t p-4 pb-20 md:pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex gap-3 max-w-2xl mx-auto">
        {showBack && onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            Back
          </Button>
        )}
        <Button
          onClick={onContinue}
          disabled={continueDisabled || isLoading}
          className={showBack && onBack ? "flex-1" : "w-full"}
          variant="airbnb"
          size="lg"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {continueLabel}
        </Button>
      </div>
    </div>
  );
};

export default BookingStickyFooter;

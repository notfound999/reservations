import { format } from 'date-fns';
import { Calendar, Clock, DollarSign, Edit2 } from 'lucide-react';
import type { Offering, TimeSlot } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ConfirmStepProps {
  offering: Offering;
  businessName: string;
  selectedDate: Date;
  selectedSlot: TimeSlot;
  notes: string;
  onNotesChange: (notes: string) => void;
  onEditDateTime: () => void;
}

const ConfirmStep = ({
  offering,
  businessName,
  selectedDate,
  selectedSlot,
  notes,
  onNotesChange,
  onEditDateTime
}: ConfirmStepProps) => {
  return (
    <div className="h-full overflow-y-auto px-6 py-8 pb-32 space-y-6">
      {/* Booking Summary Card */}
      <div className="bg-accent/30 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-lg">Booking Summary</h3>

        <div className="space-y-3">
          {/* Service */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Service</p>
            <p className="font-medium">{offering.name}</p>
            <p className="text-sm text-muted-foreground">{businessName}</p>
          </div>

          {/* Date & Time */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-airbnb-primary" />
                <p className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-airbnb-primary" />
                <p className="font-medium">{selectedSlot.time}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditDateTime}
              className="gap-1"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </Button>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="font-medium">{offering.durationMinutes} minutes</p>
          </div>

          {/* Price */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total</p>
              <div className="flex items-center gap-1">
                <DollarSign className="h-5 w-5 text-airbnb-primary" />
                <p className="text-2xl font-bold text-airbnb-primary">
                  {offering.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <Label htmlFor="notes" className="text-sm font-semibold mb-3 block">
          Add notes (optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or notes for the business..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="resize-none min-h-[120px]"
          rows={5}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Let the business know if you have any special requirements
        </p>
      </div>

      {/* Cancellation Policy Reminder */}
      <div className="bg-muted/50 rounded-xl p-5">
        <h4 className="font-semibold text-sm mb-2">Cancellation policy</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Free cancellation up to 24 hours before your appointment.
          By confirming this booking, you agree to the cancellation policy.
        </p>
      </div>
    </div>
  );
};

export default ConfirmStep;

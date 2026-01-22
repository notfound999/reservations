import { useState, useEffect } from 'react';
import { format, addDays, isSameDay, startOfDay, parse, addMinutes, isBefore, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { scheduleApi } from '@/lib/api';
import type { BusyBlock, TimeSlot, SlotStatus } from '@/lib/types';
import { SkeletonTimeSlots } from '@/components/ui/skeleton-loader';

interface DateTimeStepProps {
  businessId: string;
  durationMinutes: number;
  selectedDate: Date;
  selectedSlot: TimeSlot | null;
  onDateSelect: (date: Date) => void;
  onSlotSelect: (slot: TimeSlot) => void;
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
  const INCREMENT_MINUTES = 10;

  let current = dayStart;

  while (isBefore(current, dayEnd)) {
    const slotEnd = addMinutes(current, durationMinutes);

    if (!isBefore(slotEnd, dayEnd) && slotEnd.getTime() !== dayEnd.getTime()) {
      current = addMinutes(current, INCREMENT_MINUTES);
      continue;
    }

    const slotDateTime = format(current, "yyyy-MM-dd'T'HH:mm:ss");
    let status: SlotStatus = 'available';

    for (const block of busyBlocks) {
      const blockStart = parse(block.start, "yyyy-MM-dd'T'HH:mm:ss", new Date());
      const blockEnd = parse(block.end, "yyyy-MM-dd'T'HH:mm:ss", new Date());

      if (current < blockEnd && slotEnd > blockStart) {
        status = block.type === 'CLOSED' ? 'closed' : 'occupied';
        break;
      }
    }

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

const DateTimeStep = ({
  businessId,
  durationMinutes,
  selectedDate,
  selectedSlot,
  onDateSelect,
  onSlotSelect
}: DateTimeStepProps) => {
  const [busyBlocks, setBusyBlocks] = useState<BusyBlock[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  // Fetch busy blocks when date changes
  useEffect(() => {
    const fetchBusyBlocks = async () => {
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
  }, [businessId, selectedDate]);

  const timeSlots = generateTimeSlots(selectedDate, durationMinutes, busyBlocks);

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      onSlotSelect(slot);
    }
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* Date Picker - Sticky */}
      <div className="sticky top-0 bg-background z-10 px-6 py-4 border-b flex-shrink-0">
        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3 block">
          Select Date
        </Label>
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-2 -mx-2 px-2">
          {availableDates.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={cn(
                "flex flex-col items-center min-w-[4rem] p-3 rounded-xl border-2 transition-all flex-shrink-0",
                isSameDay(date, selectedDate)
                  ? "bg-airbnb-primary text-white border-airbnb-primary shadow-md"
                  : "bg-background hover:bg-accent border-border"
              )}
            >
              <span className="text-xs font-medium opacity-80">
                {format(date, 'EEE')}
              </span>
              <span className="text-xl font-bold my-1">
                {format(date, 'd')}
              </span>
              <span className="text-xs opacity-80">
                {format(date, 'MMM')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots - Scrollable */}
      <div className="flex-1 px-6 py-6 pb-32">
        <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4 block">
          Available Times for {format(selectedDate, 'MMMM d')}
        </Label>

        {isFetchingSlots ? (
          <SkeletonTimeSlots />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={slot.status !== 'available'}
                  className={cn(
                    "py-3 px-2 rounded-lg text-sm font-medium transition-all",
                    slot.status === 'available' && selectedSlot?.time === slot.time
                      ? "bg-airbnb-primary text-white shadow-md scale-105"
                      : slot.status === 'available'
                      ? "bg-background border-2 border-border hover:border-airbnb-primary hover:bg-accent"
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
            <div className="flex items-center gap-4 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-background border-2 border-border" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-destructive/20" />
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted" />
                <span>Closed</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimeStep;

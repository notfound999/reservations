import { useState, useMemo, useEffect } from 'react';
import {
  format,
  addDays,
  subDays,
  isSameDay,
  differenceInMinutes,
  startOfDay,
  isToday,
  getDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { CalendarEvent, WorkingDay } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BusinessCalendarProps {
  events: CalendarEvent[];
  workingDays?: WorkingDay[];
  onAddTimeOff: () => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDeleteTimeOff?: (eventId: string) => void;
}

const SLOT_HEIGHT = 30; // pixels per 30-min slot
const HEADER_HEIGHT = 60;

// Map day names to day of week numbers (0 = Sunday, 1 = Monday, etc.)
const DAY_MAP: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

// Parse time string "HH:mm" to minutes from midnight
const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Get hour from minutes
const minutesToHour = (minutes: number): number => Math.floor(minutes / 60);

export const BusinessCalendar = ({
  events,
  workingDays = [],
  onAddTimeOff,
  onDeleteTimeOff,
}: BusinessCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show 3 days on mobile, 7 on desktop
  const daysToShow = isMobile ? 3 : 7;

  // Start from yesterday (1 day before today relative to currentDate) for desktop
  // Start from today for mobile
  const viewStart = isMobile ? startOfDay(currentDate) : subDays(startOfDay(currentDate), 1);
  const weekDays = Array.from({ length: daysToShow }, (_, i) => addDays(viewStart, i));

  const goToPreviousWeek = () => setCurrentDate(subDays(currentDate, daysToShow));
  const goToNextWeek = () => setCurrentDate(addDays(currentDate, daysToShow));
  const goToToday = () => setCurrentDate(new Date());

  // Calculate business hours range from working days
  const { startHour, endHour, slots } = useMemo(() => {
    if (workingDays.length === 0) {
      // Default: 9 AM to 6 PM
      const defaultStart = 9;
      const defaultEnd = 18;
      const slotCount = (defaultEnd - defaultStart) * 2; // 30-min slots
      return {
        startHour: defaultStart,
        endHour: defaultEnd,
        slots: Array.from({ length: slotCount }, (_, i) => ({
          hour: defaultStart + Math.floor(i / 2),
          minute: (i % 2) * 30,
          index: i,
        })),
      };
    }

    // Find earliest start and latest end from all working days
    let earliestStart = 24 * 60; // Start with end of day
    let latestEnd = 0;

    workingDays.forEach(day => {
      if (!day.isDayOff && day.startTime && day.endTime) {
        const start = parseTimeToMinutes(day.startTime);
        const end = parseTimeToMinutes(day.endTime);
        if (start < earliestStart) earliestStart = start;
        if (end > latestEnd) latestEnd = end;
      }
    });

    // Default to 9-18 if no working days found
    if (earliestStart >= latestEnd) {
      earliestStart = 9 * 60;
      latestEnd = 18 * 60;
    }

    const startHr = minutesToHour(earliestStart);
    const endHr = Math.ceil(latestEnd / 60);
    const slotCount = (endHr - startHr) * 2;

    return {
      startHour: startHr,
      endHour: endHr,
      slots: Array.from({ length: slotCount }, (_, i) => ({
        hour: startHr + Math.floor(i / 2),
        minute: (i % 2) * 30,
        index: i,
      })),
    };
  }, [workingDays]);

  // Get working schedule for a specific day
  const getScheduleForDay = (date: Date): WorkingDay | undefined => {
    const dayOfWeek = getDay(date);
    return workingDays.find(wd => DAY_MAP[wd.dayOfWeek] === dayOfWeek);
  };

  // Check if a slot is within working hours for a specific day
  const isSlotWorking = (date: Date, slotHour: number, slotMinute: number): boolean => {
    const schedule = getScheduleForDay(date);
    if (!schedule || schedule.isDayOff) return false;

    const slotMinutes = slotHour * 60 + slotMinute;
    const startMinutes = parseTimeToMinutes(schedule.startTime);
    const endMinutes = parseTimeToMinutes(schedule.endTime);

    // Check if within working hours
    if (slotMinutes < startMinutes || slotMinutes >= endMinutes) return false;

    // Check if within break time
    if (schedule.breakStartTime && schedule.breakEndTime) {
      const breakStart = parseTimeToMinutes(schedule.breakStartTime);
      const breakEnd = parseTimeToMinutes(schedule.breakEndTime);
      if (slotMinutes >= breakStart && slotMinutes < breakEnd) return false;
    }

    return true;
  };

  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};

    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = events.filter(event => {
        const eventStart = event.start;
        return isSameDay(eventStart, day);
      });
    });

    return grouped;
  }, [events, weekDays]);

  const getEventStyle = (event: CalendarEvent) => {
    const dayStart = startOfDay(event.start);
    const minutesFromDayStart = differenceInMinutes(event.start, dayStart);
    const duration = differenceInMinutes(event.end, event.start);

    // Adjust for calendar start hour
    const minutesFromStart = minutesFromDayStart - (startHour * 60);
    const top = Math.max(0, (minutesFromStart / 30) * SLOT_HEIGHT);

    // Calculate proportional height based on actual duration
    // SLOT_HEIGHT represents 30 minutes, so 1 minute = SLOT_HEIGHT / 30 pixels
    const MIN_HEIGHT = 20; // Minimum height for visibility and clickability
    const height = Math.max(MIN_HEIGHT, (duration / 30) * SLOT_HEIGHT);

    return { top, height };
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.type === 'timeoff') {
      return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200';
    }

    switch (event.status) {
      case 'CONFIRMED':
        return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-200';
      case 'CANCELLED':
        return 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900/30 dark:border-gray-700 dark:text-gray-200';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200';
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const totalHeight = slots.length * SLOT_HEIGHT;

  return (
    <>
      <div className="flex flex-col h-[600px] md:h-[600px] max-h-[70vh] bg-card rounded-lg border shadow-sm">
        {/* Calendar Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-2 md:px-4 py-2 md:py-3 border-b bg-muted/30 flex-shrink-0 gap-2">
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="text-xs md:text-sm">
              Today
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-8 w-8 md:h-10 md:w-10">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-8 w-8 md:h-10 md:w-10">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-sm md:text-lg font-semibold">
              {format(viewStart, 'MMM d')} - {format(addDays(viewStart, daysToShow - 1), 'MMM d, yyyy')}
            </h2>
          </div>
          <div className="flex items-center gap-2 justify-between md:justify-end">
            {/* Legend - hidden on mobile */}
            <div className="hidden lg:flex items-center gap-3 mr-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
                <span>Confirmed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
                <span>Time Off</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-muted border border-muted-foreground/20" />
                <span>Closed</span>
              </div>
            </div>
            <Button onClick={onAddTimeOff} size="sm" className="text-xs md:text-sm">
              <Plus className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
              <span className="hidden md:inline">Add Time Off</span>
              <span className="md:hidden">Time Off</span>
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Fixed Day Headers Row */}
          <div className="flex border-b flex-shrink-0">
            <div className="w-12 md:w-16 flex-shrink-0 border-r bg-muted/20" style={{ height: HEADER_HEIGHT }} />
            <div className="flex flex-1">
              {weekDays.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const isCurrentDay = isToday(day);
                const isPast = day < startOfDay(new Date());
                const schedule = getScheduleForDay(day);
                const isDayOff = !schedule || schedule.isDayOff;

                return (
                  <div
                    key={dayKey}
                    style={{ height: HEADER_HEIGHT }}
                    className={cn(
                      'flex-1 flex flex-col items-center justify-center border-r last:border-r-0 bg-card',
                      isCurrentDay && 'bg-primary/10',
                      isPast && 'bg-muted/50',
                      isDayOff && 'bg-muted/70'
                    )}
                  >
                    <span className={cn(
                      "text-xs uppercase",
                      isPast ? "text-muted-foreground/60" : "text-muted-foreground",
                      isDayOff && "text-muted-foreground/40"
                    )}>
                      {format(day, 'EEE')}
                    </span>
                    <span
                      className={cn(
                        'text-lg font-semibold',
                        isCurrentDay && 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center',
                        isPast && !isCurrentDay && 'text-muted-foreground/60',
                        isDayOff && !isCurrentDay && 'text-muted-foreground/40'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {isDayOff && (
                      <span className="text-[10px] text-muted-foreground/50">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto">
            <div className="flex" style={{ height: totalHeight }}>
              {/* Time Column */}
              <div className="w-12 md:w-16 flex-shrink-0 border-r bg-muted/20 sticky left-0 z-10">
                {slots.map((slot, idx) => (
                  <div
                    key={idx}
                    style={{ height: SLOT_HEIGHT }}
                    className={cn(
                      "relative border-b border-dashed bg-muted/20",
                      slot.minute === 0 && "border-b-muted-foreground/30"
                    )}
                  >
                    {slot.minute === 0 && (
                      <span className="absolute -top-2 right-1 md:right-2 text-[10px] md:text-xs text-muted-foreground font-medium">
                        {format(new Date().setHours(slot.hour, 0), 'h a')}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="flex flex-1">
                {weekDays.map((day) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDay[dayKey] || [];
                  const isCurrentDay = isToday(day);
                  const isPast = day < startOfDay(new Date());

                  return (
                    <div
                      key={dayKey}
                      className={cn(
                        'flex-1 border-r last:border-r-0 relative'
                      )}
                    >
                      {/* Slot backgrounds (working/closed) */}
                      {slots.map((slot, idx) => {
                        const isWorking = isSlotWorking(day, slot.hour, slot.minute);
                        return (
                          <div
                            key={idx}
                            style={{ height: SLOT_HEIGHT }}
                            className={cn(
                              "border-b border-dashed",
                              slot.minute === 0 && "border-b-muted-foreground/20",
                              isWorking
                                ? isCurrentDay
                                  ? 'bg-primary/5'
                                  : isPast
                                  ? 'bg-muted/20'
                                  : 'bg-background'
                                : 'bg-muted/50'
                            )}
                          />
                        );
                      })}

                      {/* Events */}
                      <div className="absolute inset-0">
                        {dayEvents.map(event => {
                          const { top, height } = getEventStyle(event);

                          return (
                            <TooltipProvider key={event.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      'absolute left-1 right-1 rounded-md border px-2 py-0.5 cursor-pointer overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] group z-20',
                                      getEventColor(event)
                                    )}
                                    style={{
                                      top: `${top}px`,
                                      height: `${height}px`,
                                    }}
                                    onClick={() => handleEventClick(event)}
                                  >
                                    {event.type === 'timeoff' && onDeleteTimeOff && (
                                      <button
                                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-200 dark:hover:bg-red-800"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteTimeOff(event.id);
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    )}
                                    <div className="flex flex-col h-full justify-center">
                                      <p className="text-[10px] md:text-xs font-medium truncate leading-tight">
                                        {event.title}
                                      </p>
                                      {height > SLOT_HEIGHT && (
                                        <p className="text-[9px] md:text-[10px] opacity-75 truncate leading-tight">
                                          {format(event.start, 'h:mm')} - {format(event.end, 'h:mm a')}
                                        </p>
                                      )}
                                      {height > SLOT_HEIGHT * 2 && event.customerName && (
                                        <p className="text-[9px] md:text-[10px] opacity-75 truncate leading-tight">
                                          {event.customerName}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="font-medium">{event.title}</p>
                                    <p className="text-xs">{format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}</p>
                                    {event.customerName && <p className="text-xs">Customer: {event.customerName}</p>}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.type === 'timeoff' ? (
                <>
                  <div className="w-3 h-3 rounded bg-red-500" />
                  Time Off / Holiday
                </>
              ) : (
                <>
                  <div className={cn(
                    "w-3 h-3 rounded",
                    selectedEvent?.status === 'CONFIRMED' && "bg-green-500",
                    selectedEvent?.status === 'PENDING' && "bg-yellow-500",
                    selectedEvent?.status === 'CANCELLED' && "bg-gray-500"
                  )} />
                  Reservation Details
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 mt-4">
              <div className="bg-accent/50 rounded-lg p-4">
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                {selectedEvent.serviceName && selectedEvent.serviceName !== selectedEvent.title && (
                  <p className="text-sm text-muted-foreground">{selectedEvent.serviceName}</p>
                )}
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">
                    {format(selectedEvent.start, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedEvent.start, 'h:mm a')} - {format(selectedEvent.end, 'h:mm a')}
                  </p>
                </div>
              </div>

              {selectedEvent.type === 'reservation' && selectedEvent.customerName && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedEvent.customerName}</p>
                    <p className="text-sm text-muted-foreground">Customer</p>
                  </div>
                </div>
              )}

              {selectedEvent.type === 'timeoff' && selectedEvent.reason && (
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Reason</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.reason}</p>
                  </div>
                </div>
              )}

              {selectedEvent.status && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={getStatusBadgeVariant(selectedEvent.status)}>
                      {selectedEvent.status}
                    </Badge>
                  </div>
                </div>
              )}

              {selectedEvent.type === 'timeoff' && onDeleteTimeOff && (
                <div className="pt-2 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onDeleteTimeOff(selectedEvent.id);
                      setIsDetailModalOpen(false);
                    }}
                  >
                    Delete Time Off
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BusinessCalendar;

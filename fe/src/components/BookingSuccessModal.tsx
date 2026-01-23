import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { createEvent, EventAttributes } from 'ics';
import { format, parse } from 'date-fns';
import { Calendar, Share2, Eye, Check, Clock, DollarSign } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Offering } from '@/lib/types';

interface BookingSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offering: Offering | null;
  businessName: string;
  selectedDate: Date;
  selectedTime: string;
}

const BookingSuccessModal = ({
  open,
  onOpenChange,
  offering,
  businessName,
  selectedDate,
  selectedTime,
}: BookingSuccessModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Trigger confetti when modal opens
  useEffect(() => {
    if (open) {
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#ea580c', '#f97316', '#fb923c', '#fdba74'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [open]);

  if (!offering || !selectedTime || !selectedDate) return null;

  const appointmentDateTime = parse(selectedTime, 'HH:mm', selectedDate);

  // Validate the parsed date
  if (isNaN(appointmentDateTime.getTime())) {
    console.error('Invalid date/time:', { selectedDate, selectedTime });
    return null;
  }

  const handleAddToCalendar = () => {
    try {
      const event: EventAttributes = {
        start: [
          appointmentDateTime.getFullYear(),
          appointmentDateTime.getMonth() + 1,
          appointmentDateTime.getDate(),
          appointmentDateTime.getHours(),
          appointmentDateTime.getMinutes(),
        ],
        duration: { minutes: offering.durationMinutes },
        title: `${offering.name} at ${businessName}`,
        description: offering.description,
        location: businessName,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
      };

      createEvent(event, (error, value) => {
        if (error) {
          console.error('Error creating calendar event:', error);
          toast({
            title: 'Error',
            description: 'Could not create calendar event',
            variant: 'destructive',
          });
          return;
        }

        // Create blob and download
        const blob = new Blob([value], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `booking-${businessName.replace(/\s+/g, '-')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: 'Calendar event created',
          description: 'The event has been downloaded to your device',
        });
      });
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast({
        title: 'Error',
        description: 'Could not create calendar event',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Appointment Booked',
      text: `I booked an appointment for ${offering.name} at ${businessName} on ${format(
        appointmentDateTime,
        'MMMM d, yyyy'
      )} at ${selectedTime}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled share
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: 'Copied to clipboard',
          description: 'Booking details copied to clipboard',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not share booking',
          variant: 'destructive',
        });
      }
    }
  };

  const handleViewReservations = () => {
    onOpenChange(false);
    navigate('/my-reservations');
  };

  const handleClose = () => {
    onOpenChange(false);
    // On mobile, redirect to homepage after closing success modal
    if (isMobile) {
      navigate('/');
    }
  };

  const content = (
    <div className="space-y-6 py-4">
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="h-10 w-10 text-primary" />
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-2"
      >
        <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
        <p className="text-muted-foreground">
          Your appointment has been successfully booked
        </p>
      </motion.div>

      {/* Booking Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-primary/20 bg-accent/30">
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Service</p>
              <p className="font-semibold">{offering.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Business</p>
              <p className="font-medium">{businessName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="font-medium text-sm">
                    {format(appointmentDateTime, 'MMM d, yyyy')}
                  </p>
                </div>
                <p className="text-sm font-medium ml-5">{selectedTime}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="font-medium text-sm">{offering.durationMinutes} min</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Price</p>
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-primary" />
                <p className="font-semibold text-lg">{offering.price.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <Button
          onClick={handleAddToCalendar}
          variant="outline"
          className="w-full gap-2"
        >
          <Calendar className="h-4 w-4" />
          Add to Calendar
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleShare} variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleViewReservations} variant="default" className="gap-2">
            <Eye className="h-4 w-4" />
            View Bookings
          </Button>
        </div>
      </motion.div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="sr-only">Booking Confirmed</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Booking Confirmed</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default BookingSuccessModal;

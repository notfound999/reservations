import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isPast, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, Loader2, CalendarX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { reservationsApi } from '@/lib/api';
import type { Reservation } from '@/lib/types';

const statusConfig: Record<Reservation['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  COMPLETED: { label: 'Completed', variant: 'outline' },
};

const MyReservations = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const data = await reservationsApi.getMyReservations();
        setReservations(data);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        toast({ title: 'Error', description: 'Could not load reservations', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated, toast]);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcomingList: Reservation[] = [];
    const pastList: Reservation[] = [];

    reservations.forEach((reservation) => {
      const startDate = parseISO(reservation.startDateTime);
      if (isPast(startDate) || reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
        pastList.push(reservation);
      } else {
        upcomingList.push(reservation);
      }
    });

    upcomingList.sort((a, b) => parseISO(a.startDateTime).getTime() - parseISO(b.startDateTime).getTime());
    pastList.sort((a, b) => parseISO(b.startDateTime).getTime() - parseISO(a.startDateTime).getTime());

    return { upcoming: upcomingList, past: pastList };
  }, [reservations]);

  const handleCancelReservation = async (id: string) => {
    setCancellingId(id);
    try {
      await reservationsApi.cancel(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' as const } : r))
      );
      toast({ title: 'Reservation cancelled', description: 'Your reservation has been cancelled.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not cancel reservation', variant: 'destructive' });
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEE, MMM d, yyyy 'at' h:mm a");
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const durationMins = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    if (durationMins >= 60) {
      const hours = Math.floor(durationMins / 60);
      const mins = durationMins % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${durationMins}m`;
  };

  const ReservationCard = ({ reservation, showCancel = false }: { reservation: Reservation; showCancel?: boolean }) => {
    const status = statusConfig[reservation.status];
    const canCancel = showCancel && (reservation.status === 'PENDING' || reservation.status === 'CONFIRMED');

    return (
      <Card>
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
            <div className="flex-1 space-y-2 md:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-base md:text-lg">{reservation.offeringName}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{reservation.businessName}</p>
                </div>
                <Badge variant={status.variant} className="self-start text-xs md:text-sm">{status.label}</Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 md:gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDateTime(reservation.startDateTime)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDuration(reservation.startDateTime, reservation.endDateTime)}</span>
                </div>
              </div>
            </div>

            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                onClick={() => setConfirmCancelId(reservation.id)}
                disabled={cancellingId === reservation.id}
              >
                {cancellingId === reservation.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type }: { type: 'upcoming' | 'past' }) => (
    <Card>
      <CardContent className="py-12 md:py-16 text-center p-4 md:p-6">
        <CalendarX className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-base md:text-lg font-medium mb-2">
          {type === 'upcoming' ? 'No upcoming reservations' : 'No past reservations'}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground mb-6">
          {type === 'upcoming'
            ? "You don't have any scheduled appointments."
            : "You haven't made any reservations yet."}
        </p>
        {type === 'upcoming' && (
          <Button onClick={() => navigate('/')} className="w-full sm:w-auto">Browse Services</Button>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="container max-w-3xl px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">My Reservations</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View and manage your upcoming and past appointments
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4 md:space-y-6">
          <TabsList className="bg-secondary/50 w-full sm:w-auto">
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <Clock className="h-4 w-4" />
              Past ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length > 0 ? (
              upcoming.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} showCancel />
              ))
            ) : (
              <EmptyState type="upcoming" />
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {past.length > 0 ? (
              past.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))
            ) : (
              <EmptyState type="past" />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!confirmCancelId} onOpenChange={() => setConfirmCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmCancelId && handleCancelReservation(confirmCancelId)}
            >
              Cancel Reservation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyReservations;

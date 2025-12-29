import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Clock, DollarSign, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const BookReservation = () => {
  const { businessId, serviceId } = useParams<{ businessId: string; serviceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Mock data - replace with API calls
  const business = {
    id: businessId,
    name: "My Dental Clinic",
  };

  const service = {
    id: serviceId,
    name: "General Checkup",
    description: "Comprehensive dental examination",
    price: 75,
    durationMinutes: 30,
  };

  const availableSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select date and time",
        description: "Choose a date and time slot to complete your booking.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    // Simulate API call
    setTimeout(() => {
      setIsBooking(false);
      toast({
        title: "Reservation confirmed!",
        description: `Your appointment is booked for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
      });
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <DashboardLayout title="Book Reservation" subtitle={`${business.name} - ${service.name}`}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Back button */}
        <Link to={`/business/${businessId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Business
        </Link>

        {/* Service Info */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">
            {service.name}
          </h2>
          <p className="text-muted-foreground mb-4">{service.description}</p>
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <DollarSign className="w-4 h-4 text-primary" />
              ${service.price}
            </span>
            <span className="flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              {service.durationMinutes} minutes
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Select Date
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
              className="rounded-xl border-0 pointer-events-auto"
            />
          </div>

          {/* Time Slots */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Select Time
            </h3>
            {selectedDate ? (
              <div className="grid grid-cols-3 gap-3">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted hover:bg-accent text-foreground"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Please select a date first</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary & Book Button */}
        {selectedDate && selectedTime && (
          <div className="p-6 rounded-2xl bg-primary-light border border-primary/20 animate-scale-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted-foreground">at {selectedTime}</p>
                </div>
              </div>
              <Button 
                onClick={handleBooking} 
                variant="gradient" 
                size="lg"
                disabled={isBooking}
              >
                {isBooking ? "Booking..." : `Confirm Booking - $${service.price}`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BookReservation;

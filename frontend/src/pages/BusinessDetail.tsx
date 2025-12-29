import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Settings, 
  Calendar,
  Users,
  Package,
  Plus,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Business, BusinessSchedule, WorkingDay, Offering, TimeOff } from "@/types";

const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

const defaultWorkingDays: WorkingDay[] = daysOfWeek.map((day) => ({
  dayOfWeek: day,
  startTime: "09:00",
  endTime: "17:00",
  breakStartTime: "12:00",
  breakEndTime: "13:00",
  isDayOff: day === 'SATURDAY' || day === 'SUNDAY',
}));

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // Mock current user ID - replace with actual auth
  const currentUserId = "currentUser";
  
  const [business] = useState<Business>({
    id: id || "1",
    name: "My Dental Clinic",
    description: "Full dental care services for the whole family.",
    address: "100 Health St, Bronx, NY",
    phone: "+1 (555) 111-2222",
    ownerId: "user1", // Different owner to test non-owner view
    createdAt: new Date().toISOString(),
  });

  const [admins, setAdmins] = useState<{ id: string; email: string; name: string; userId?: string }[]>([
    { id: "1", email: "admin@example.com", name: "Admin User", userId: "adminUser1" },
  ]);

  // Check if current user is owner or admin
  const isOwnerOrAdmin = business.ownerId === currentUserId || 
    admins.some(admin => admin.userId === currentUserId);

  const [schedule, setSchedule] = useState<BusinessSchedule>({
    id: "schedule1",
    businessId: id || "1",
    reservationType: "APPOINTMENT",
    slotDurationValue: 30,
    slotDurationUnit: "MINUTES",
    minAdvanceBookingHours: 24,
    maxAdvanceBookingDays: 30,
    autoConfirmAppointments: true,
    workingDays: defaultWorkingDays,
  });

  const [offerings, setOfferings] = useState<Offering[]>([
    {
      id: "1",
      name: "General Checkup",
      description: "Comprehensive dental examination",
      price: 75,
      durationMinutes: 30,
      bufferTimeMinutes: 10,
      businessId: id || "1",
    },
    {
      id: "2",
      name: "Teeth Cleaning",
      description: "Professional dental cleaning service",
      price: 120,
      durationMinutes: 45,
      bufferTimeMinutes: 15,
      businessId: id || "1",
    },
  ]);

  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);


  // Dialog states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [offeringDialogOpen, setOfferingDialogOpen] = useState(false);
  const [timeOffDialogOpen, setTimeOffDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [offeringForm, setOfferingForm] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: "",
    bufferTimeMinutes: "",
  });

  const [timeOffForm, setTimeOffForm] = useState({
    startDateTime: "",
    endDateTime: "",
    reason: "",
  });

  const [adminEmail, setAdminEmail] = useState("");

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState(schedule);

  const handleScheduleSave = () => {
    setSchedule(scheduleForm);
    setScheduleDialogOpen(false);
    toast({
      title: "Schedule updated",
      description: "Your business schedule has been saved.",
    });
  };

  const handleOfferingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingOffering) {
      setOfferings((prev) =>
        prev.map((o) =>
          o.id === editingOffering.id
            ? {
                ...o,
                name: offeringForm.name,
                description: offeringForm.description,
                price: parseFloat(offeringForm.price),
                durationMinutes: parseInt(offeringForm.durationMinutes),
                bufferTimeMinutes: parseInt(offeringForm.bufferTimeMinutes),
              }
            : o
        )
      );
      toast({ title: "Service updated" });
    } else {
      const newOffering: Offering = {
        id: Date.now().toString(),
        name: offeringForm.name,
        description: offeringForm.description,
        price: parseFloat(offeringForm.price),
        durationMinutes: parseInt(offeringForm.durationMinutes),
        bufferTimeMinutes: parseInt(offeringForm.bufferTimeMinutes),
        businessId: id || "1",
      };
      setOfferings((prev) => [...prev, newOffering]);
      toast({ title: "Service created" });
    }
    
    setOfferingDialogOpen(false);
    setEditingOffering(null);
    setOfferingForm({ name: "", description: "", price: "", durationMinutes: "", bufferTimeMinutes: "" });
  };

  const handleEditOffering = (offering: Offering) => {
    setEditingOffering(offering);
    setOfferingForm({
      name: offering.name,
      description: offering.description,
      price: offering.price.toString(),
      durationMinutes: offering.durationMinutes.toString(),
      bufferTimeMinutes: offering.bufferTimeMinutes.toString(),
    });
    setOfferingDialogOpen(true);
  };

  const handleDeleteOffering = (offeringId: string) => {
    setOfferings((prev) => prev.filter((o) => o.id !== offeringId));
    toast({ title: "Service deleted", variant: "destructive" });
  };

  const handleTimeOffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTimeOff: TimeOff = {
      id: Date.now().toString(),
      businessId: id || "1",
      startDateTime: timeOffForm.startDateTime,
      endDateTime: timeOffForm.endDateTime,
      reason: timeOffForm.reason,
    };
    setTimeOffs((prev) => [...prev, newTimeOff]);
    setTimeOffDialogOpen(false);
    setTimeOffForm({ startDateTime: "", endDateTime: "", reason: "" });
    toast({ title: "Time off added" });
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const newAdmin = {
      id: Date.now().toString(),
      email: adminEmail,
      name: adminEmail.split("@")[0],
    };
    setAdmins((prev) => [...prev, newAdmin]);
    setAdminDialogOpen(false);
    setAdminEmail("");
    toast({ title: "Admin added" });
  };

  return (
    <DashboardLayout title={business.name} subtitle={isOwnerOrAdmin ? "Manage your business" : "View business details"}>
      <div className="space-y-6 animate-fade-in">
        {/* Back button */}
        <Link to={isOwnerOrAdmin ? "/my-businesses" : "/dashboard"} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {isOwnerOrAdmin ? "Back to My Businesses" : "Back to Dashboard"}
        </Link>

        {/* Business Info Card */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-semibold text-foreground mb-1">
                {business.name}
              </h2>
              <p className="text-muted-foreground mb-4">{business.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {business.address}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {business.phone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="offerings" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="offerings" className="rounded-lg gap-2">
              <Package className="w-4 h-4" />
              Services
            </TabsTrigger>
            {isOwnerOrAdmin && (
              <>
                <TabsTrigger value="schedule" className="rounded-lg gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="admins" className="rounded-lg gap-2">
                  <Users className="w-4 h-4" />
                  Admins
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Offerings Tab */}
          <TabsContent value="offerings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-foreground">
                Services ({offerings.length})
              </h3>
              {isOwnerOrAdmin && (
                <Button onClick={() => {
                  setEditingOffering(null);
                  setOfferingForm({ name: "", description: "", price: "", durationMinutes: "", bufferTimeMinutes: "" });
                  setOfferingDialogOpen(true);
                }} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Service
                </Button>
              )}
            </div>

            {offerings.length === 0 ? (
              <div className="text-center py-12 bg-muted/50 rounded-2xl">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {isOwnerOrAdmin 
                    ? "No services yet. Add your first service to start accepting bookings." 
                    : "No services available yet."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {offerings.map((offering) => (
                  <div key={offering.id} className="flex items-center justify-between p-5 rounded-xl bg-card border border-border">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{offering.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{offering.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${offering.price}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {offering.durationMinutes} min
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/book/${business.id}/${offering.id}`}>
                        <Button variant="outline" size="sm">Book</Button>
                      </Link>
                      {isOwnerOrAdmin && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleEditOffering(offering)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteOffering(offering.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Schedule Tab - Only for owners/admins */}
          {isOwnerOrAdmin && (
            <TabsContent value="schedule" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold text-foreground">
                  Business Schedule
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setTimeOffDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Time Off
                  </Button>
                  <Button onClick={() => {
                    setScheduleForm(schedule);
                    setScheduleDialogOpen(true);
                  }} className="gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Schedule
                  </Button>
                </div>
              </div>

              {/* Schedule Summary */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-card border border-border">
                  <h4 className="font-semibold text-foreground mb-3">Booking Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slot Duration</span>
                      <span className="text-foreground">{schedule.slotDurationValue} {schedule.slotDurationUnit.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Advance Booking</span>
                      <span className="text-foreground">{schedule.minAdvanceBookingHours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Advance Booking</span>
                      <span className="text-foreground">{schedule.maxAdvanceBookingDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Auto Confirm</span>
                      <span className="text-foreground">{schedule.autoConfirmAppointments ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-card border border-border">
                  <h4 className="font-semibold text-foreground mb-3">Working Hours</h4>
                  <div className="space-y-2 text-sm">
                    {schedule.workingDays.map((day) => (
                      <div key={day.dayOfWeek} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{day.dayOfWeek.toLowerCase()}</span>
                        <span className="text-foreground">
                          {day.isDayOff ? "Closed" : `${day.startTime} - ${day.endTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time Offs */}
              {timeOffs.length > 0 && (
                <div className="p-5 rounded-xl bg-card border border-border">
                  <h4 className="font-semibold text-foreground mb-3">Scheduled Time Off</h4>
                  <div className="space-y-2">
                    {timeOffs.map((timeOff) => (
                      <div key={timeOff.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm text-foreground">
                            {new Date(timeOff.startDateTime).toLocaleDateString()} - {new Date(timeOff.endDateTime).toLocaleDateString()}
                          </p>
                          {timeOff.reason && (
                            <p className="text-xs text-muted-foreground">{timeOff.reason}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setTimeOffs((prev) => prev.filter((t) => t.id !== timeOff.id))}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}

          {/* Admins Tab - Only for owners/admins */}
          {isOwnerOrAdmin && (
            <TabsContent value="admins" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold text-foreground">
                  Business Admins ({admins.length})
                </h3>
                <Button onClick={() => setAdminDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Admin
                </Button>
              </div>

              <div className="grid gap-4">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-5 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{admin.name}</p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setAdmins((prev) => prev.filter((a) => a.id !== admin.id))}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Offering Dialog */}
        <Dialog open={offeringDialogOpen} onOpenChange={setOfferingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingOffering ? "Edit Service" : "Add New Service"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleOfferingSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="offeringName">Service Name</Label>
                <Input
                  id="offeringName"
                  placeholder="e.g., Haircut, Consultation"
                  value={offeringForm.name}
                  onChange={(e) => setOfferingForm({ ...offeringForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offeringDescription">Description</Label>
                <Textarea
                  id="offeringDescription"
                  placeholder="Describe the service"
                  value={offeringForm.description}
                  onChange={(e) => setOfferingForm({ ...offeringForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offeringPrice">Price ($)</Label>
                  <Input
                    id="offeringPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={offeringForm.price}
                    onChange={(e) => setOfferingForm({ ...offeringForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offeringDuration">Duration (min)</Label>
                  <Input
                    id="offeringDuration"
                    type="number"
                    min="5"
                    placeholder="30"
                    value={offeringForm.durationMinutes}
                    onChange={(e) => setOfferingForm({ ...offeringForm, durationMinutes: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offeringBuffer">Buffer Time (min)</Label>
                <Input
                  id="offeringBuffer"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={offeringForm.bufferTimeMinutes}
                  onChange={(e) => setOfferingForm({ ...offeringForm, bufferTimeMinutes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOfferingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingOffering ? "Save Changes" : "Add Service"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Edit Business Schedule</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slot Duration</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="5"
                      value={scheduleForm.slotDurationValue}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, slotDurationValue: parseInt(e.target.value) })}
                    />
                    <Select
                      value={scheduleForm.slotDurationUnit}
                      onValueChange={(value: 'MINUTES' | 'HOURS') => setScheduleForm({ ...scheduleForm, slotDurationUnit: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MINUTES">Minutes</SelectItem>
                        <SelectItem value="HOURS">Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reservation Type</Label>
                  <Input
                    value={scheduleForm.reservationType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, reservationType: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Advance Booking (hours)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={scheduleForm.minAdvanceBookingHours}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, minAdvanceBookingHours: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Advance Booking (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={scheduleForm.maxAdvanceBookingDays}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, maxAdvanceBookingDays: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={scheduleForm.autoConfirmAppointments}
                  onCheckedChange={(checked) => setScheduleForm({ ...scheduleForm, autoConfirmAppointments: checked })}
                />
                <Label>Auto-confirm appointments</Label>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Working Days</Label>
                {scheduleForm.workingDays.map((day, index) => (
                  <div key={day.dayOfWeek} className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{day.dayOfWeek.toLowerCase()}</span>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`dayOff-${day.dayOfWeek}`} className="text-sm text-muted-foreground">Day Off</Label>
                        <Switch
                          id={`dayOff-${day.dayOfWeek}`}
                          checked={day.isDayOff}
                          onCheckedChange={(checked) => {
                            const newDays = [...scheduleForm.workingDays];
                            newDays[index] = { ...day, isDayOff: checked };
                            setScheduleForm({ ...scheduleForm, workingDays: newDays });
                          }}
                        />
                      </div>
                    </div>
                    {!day.isDayOff && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Work Hours</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={day.startTime}
                              onChange={(e) => {
                                const newDays = [...scheduleForm.workingDays];
                                newDays[index] = { ...day, startTime: e.target.value };
                                setScheduleForm({ ...scheduleForm, workingDays: newDays });
                              }}
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={day.endTime}
                              onChange={(e) => {
                                const newDays = [...scheduleForm.workingDays];
                                newDays[index] = { ...day, endTime: e.target.value };
                                setScheduleForm({ ...scheduleForm, workingDays: newDays });
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Break Time</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={day.breakStartTime || ""}
                              onChange={(e) => {
                                const newDays = [...scheduleForm.workingDays];
                                newDays[index] = { ...day, breakStartTime: e.target.value };
                                setScheduleForm({ ...scheduleForm, workingDays: newDays });
                              }}
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={day.breakEndTime || ""}
                              onChange={(e) => {
                                const newDays = [...scheduleForm.workingDays];
                                newDays[index] = { ...day, breakEndTime: e.target.value };
                                setScheduleForm({ ...scheduleForm, workingDays: newDays });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleSave}>Save Schedule</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Time Off Dialog */}
        <Dialog open={timeOffDialogOpen} onOpenChange={setTimeOffDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add Time Off</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleTimeOffSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="timeOffStart">Start Date & Time</Label>
                <Input
                  id="timeOffStart"
                  type="datetime-local"
                  value={timeOffForm.startDateTime}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, startDateTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeOffEnd">End Date & Time</Label>
                <Input
                  id="timeOffEnd"
                  type="datetime-local"
                  value={timeOffForm.endDateTime}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, endDateTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeOffReason">Reason (optional)</Label>
                <Input
                  id="timeOffReason"
                  placeholder="e.g., Holiday, Vacation"
                  value={timeOffForm.reason}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setTimeOffDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Time Off</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Admin Dialog */}
        <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add Business Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAdmin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email Address</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setAdminDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Admin</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default BusinessDetail;

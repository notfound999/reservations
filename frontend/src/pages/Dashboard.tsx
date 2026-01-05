import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Building2, Plus, Clock, DollarSign, 
  Calendar, Settings, List, Loader2, Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { businessApi, offeringsApi } from '@/lib/api';
import type { Business, Offering } from '@/lib/types';

const businessSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Phone number is required'),
});

const offeringSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  durationMinutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes'),
  bufferTimeMinutes: z.coerce.number().min(0, 'Buffer time cannot be negative'),
});

type BusinessFormData = z.infer<typeof businessSchema>;
type OfferingFormData = z.infer<typeof offeringSchema>;

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const [isAddOfferingOpen, setIsAddOfferingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const businessForm = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: { name: '', description: '', address: '', phone: '' },
  });

  const offeringForm = useForm<OfferingFormData>({
    resolver: zodResolver(offeringSchema),
    defaultValues: { name: '', description: '', price: 0, durationMinutes: 60, bufferTimeMinutes: 10 },
  });

  // Fetch user's businesses on mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setIsFetching(true);
        const data = await businessApi.getMyBusinesses();
        setBusinesses(data);
        if (data.length > 0) {
          setSelectedBusiness(data[0]);
        }
      } catch (err) {
        console.error('Error fetching businesses:', err);
      } finally {
        setIsFetching(false);
      }
    };

    if (isAuthenticated) {
      fetchBusinesses();
    }
  }, [isAuthenticated]);

  // Fetch offerings when selected business changes
  useEffect(() => {
    const fetchOfferings = async () => {
      if (!selectedBusiness) {
        setOfferings([]);
        return;
      }

      try {
        const data = await offeringsApi.getByBusiness(selectedBusiness.id);
        setOfferings(data);
      } catch (err) {
        console.error('Error fetching offerings:', err);
        setOfferings([]);
      }
    };

    fetchOfferings();
  }, [selectedBusiness]);

  const handleCreateBusiness = async (data: BusinessFormData) => {
    setIsLoading(true);
    try {
      const newBusiness = await businessApi.create({
        name: data.name,
        description: data.description,
        address: data.address,
        phone: data.phone,
      });
      setBusinesses(prev => [...prev, newBusiness]);
      setSelectedBusiness(newBusiness);
      setIsAddBusinessOpen(false);
      businessForm.reset();
      
      toast({ title: 'Business created!', description: 'Your business has been listed.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not create business', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOffering = async (data: OfferingFormData) => {
    if (!selectedBusiness) return;
    
    setIsLoading(true);
    try {
      const newOffering = await offeringsApi.create(selectedBusiness.id, {
        name: data.name,
        description: data.description,
        price: data.price,
        durationMinutes: data.durationMinutes,
        bufferTimeMinutes: data.bufferTimeMinutes,
      });
      setOfferings(prev => [...prev, newOffering]);
      setIsAddOfferingOpen(false);
      offeringForm.reset();
      
      toast({ title: 'Service added!', description: 'Your new service is now available for booking.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not add service', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOffering = async (id: string) => {
    try {
      await offeringsApi.delete(id);
      setOfferings(prev => prev.filter(o => o.id !== id));
      toast({ title: 'Service deleted', description: 'The service has been removed.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not delete service', variant: 'destructive' });
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Business Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your businesses, services, and bookings
          </p>
        </div>

        {businesses.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No businesses yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first business to start accepting bookings
              </p>
              <Dialog open={isAddBusinessOpen} onOpenChange={setIsAddBusinessOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Business
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Business</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={businessForm.handleSubmit(handleCreateBusiness)} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Name</Label>
                      <Input id="name" {...businessForm.register('name')} className="h-11" />
                      {businessForm.formState.errors.name && (
                        <p className="text-sm text-destructive">{businessForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" {...businessForm.register('description')} rows={3} />
                      {businessForm.formState.errors.description && (
                        <p className="text-sm text-destructive">{businessForm.formState.errors.description.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" {...businessForm.register('address')} className="h-11" />
                      {businessForm.formState.errors.address && (
                        <p className="text-sm text-destructive">{businessForm.formState.errors.address.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" {...businessForm.register('phone')} className="h-11" />
                      {businessForm.formState.errors.phone && (
                        <p className="text-sm text-destructive">{businessForm.formState.errors.phone.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Business
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="overview" className="gap-2">
                <Building2 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2">
                <List className="h-4 w-4" />
                My Services
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">-</p>
                        <p className="text-sm text-muted-foreground">Bookings this week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-available/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-available" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">-</p>
                        <p className="text-sm text-muted-foreground">Revenue this week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                        <Clock className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">-</p>
                        <p className="text-sm text-muted-foreground">Hours booked</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Your active business listing</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedBusiness && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground text-sm">Name</Label>
                        <p className="font-medium">{selectedBusiness.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Description</Label>
                        <p>{selectedBusiness.description}</p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground text-sm">Address</Label>
                          <p>{selectedBusiness.address}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Phone</Label>
                          <p>{selectedBusiness.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Services</h2>
                  <p className="text-muted-foreground">{offerings.length} services listed</p>
                </div>
                <Dialog open={isAddOfferingOpen} onOpenChange={setIsAddOfferingOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Service</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={offeringForm.handleSubmit(handleCreateOffering)} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="serviceName">Service Name</Label>
                        <Input id="serviceName" {...offeringForm.register('name')} className="h-11" />
                        {offeringForm.formState.errors.name && (
                          <p className="text-sm text-destructive">{offeringForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceDescription">Description</Label>
                        <Textarea id="serviceDescription" {...offeringForm.register('description')} rows={3} />
                        {offeringForm.formState.errors.description && (
                          <p className="text-sm text-destructive">{offeringForm.formState.errors.description.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Price ($)</Label>
                          <Input id="price" type="number" step="0.01" {...offeringForm.register('price')} className="h-11" />
                          {offeringForm.formState.errors.price && (
                            <p className="text-sm text-destructive">{offeringForm.formState.errors.price.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (min)</Label>
                          <Input id="duration" type="number" {...offeringForm.register('durationMinutes')} className="h-11" />
                          {offeringForm.formState.errors.durationMinutes && (
                            <p className="text-sm text-destructive">{offeringForm.formState.errors.durationMinutes.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buffer">Buffer Time (min)</Label>
                        <Input id="buffer" type="number" {...offeringForm.register('bufferTimeMinutes')} className="h-11" />
                        <p className="text-xs text-muted-foreground">Time between appointments for preparation</p>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Service
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {offerings.length > 0 ? (
                  offerings.map((offering) => (
                    <Card key={offering.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">{offering.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{offering.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{offering.durationMinutes} min</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">${offering.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteOffering(offering.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No services yet. Add your first service to start accepting bookings.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Settings</CardTitle>
                  <CardDescription>
                    Configure your business hours and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Schedule settings coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Business Settings</CardTitle>
                  <CardDescription>
                    Manage your business configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Settings coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
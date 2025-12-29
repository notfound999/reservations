import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Building2, 
  MapPin, 
  Phone, 
  Edit2, 
  Trash2,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Business } from "@/types";

const MyBusinesses = () => {
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([
    {
      id: "1",
      name: "My Dental Clinic",
      description: "Full dental care services for the whole family.",
      address: "100 Health St, Bronx, NY",
      phone: "+1 (555) 111-2222",
      ownerId: "currentUser",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
  });

  const handleOpenCreate = () => {
    setEditingBusiness(null);
    setFormData({ name: "", description: "", address: "", phone: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (business: Business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      description: business.description,
      address: business.address,
      phone: business.phone,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBusiness) {
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === editingBusiness.id ? { ...b, ...formData } : b
        )
      );
      toast({
        title: "Business updated",
        description: "Your business has been updated successfully.",
      });
    } else {
      const newBusiness: Business = {
        id: Date.now().toString(),
        ...formData,
        ownerId: "currentUser",
        createdAt: new Date().toISOString(),
      };
      setBusinesses((prev) => [...prev, newBusiness]);
      toast({
        title: "Business created",
        description: "Your new business has been created successfully.",
      });
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    toast({
      title: "Business deleted",
      description: "The business has been removed.",
      variant: "destructive",
    });
  };

  return (
    <DashboardLayout title="My Businesses" subtitle="Manage your business listings">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {businesses.length} {businesses.length === 1 ? "business" : "businesses"} registered
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Business
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingBusiness ? "Edit Business" : "Create New Business"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter business name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your business"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter business address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBusiness ? "Save Changes" : "Create Business"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Business List */}
        {businesses.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">
              No businesses yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first business to start accepting reservations.
            </p>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Business
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {businesses.map((business, index) => (
              <div
                key={business.id}
                className="flex items-start justify-between p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link to={`/business/${business.id}`} className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-display font-semibold text-foreground mb-1 hover:text-primary transition-colors">
                      {business.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {business.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{business.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{business.phone}</span>
                      </div>
                    </div>
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenEdit(business)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(business.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBusinesses;

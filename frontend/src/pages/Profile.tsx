import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Save, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
// 1. Import your authService instead of raw axios
import authService from "@/services/authService";

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "",
    phone: "",
  });

  const [editData, setEditData] = useState(userData);

  // 2. Fetch data using the service (No manual headers or URLs!)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setUserData(data);
        setEditData(data);
      } catch (error: any) {
        toast({
          title: "Session Error",
          description: "Could not load profile. Please sign in again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [toast]);

  // 3. Save data using the service
  const handleSave = async () => {
    try {
      // This sends a PUT request to /api/auth/me via your helper
      const updatedData = await authService.updateProfile(editData);
      setUserData(updatedData);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save profile changes.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  if (loading) {
    return (
        <DashboardLayout title="Profile">
          <div className="flex items-center justify-center h-64">
            <p className="animate-pulse text-muted-foreground">Loading your details...</p>
          </div>
        </DashboardLayout>
    );
  }

  return (
      <DashboardLayout title="Profile" subtitle="Manage your account settings">
        <div className="max-w-2xl animate-fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/80 to-primary p-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">
                    {userData.name}
                  </h2>
                  <p className="text-white/80">{userData.email}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-semibold text-foreground">
                  Personal Information
                </h3>
                {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  {isEditing ? (
                      <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                  ) : (
                      <p className="text-foreground py-2 font-medium">{userData.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  {/* We usually keep email read-only for security, but allow editing here if needed */}
                  {isEditing ? (
                      <Input
                          id="email"
                          type="email"
                          disabled // Often disabled to prevent account mapping issues
                          value={editData.email}
                          className="bg-muted"
                      />
                  ) : (
                      <p className="text-foreground py-2 font-medium">{userData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                      <Input
                          id="phone"
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                  ) : (
                      <p className="text-foreground py-2 font-medium">{userData.phone}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
  );
};

export default Profile;
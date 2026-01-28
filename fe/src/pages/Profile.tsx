import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Pencil, LogOut, Loader2, X, Check, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, fileApi, getBaseUrl } from '@/lib/api';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true);
        const data = await userApi.getProfile();
        setProfileData({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
        });
        if (data.avatarUrl) {
          setAvatarUrl(data.avatarUrl.startsWith('http') ? data.avatarUrl : `${getBaseUrl()}${data.avatarUrl}`);
        }
        form.reset({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (user) {
          setProfileData({
            name: user.name,
            email: user.email || '',
            phone: user.phone || '',
          });
          if (user.avatarUrl) {
            setAvatarUrl(user.avatarUrl.startsWith('http') ? user.avatarUrl : `${getBaseUrl()}${user.avatarUrl}`);
          }
          form.reset({
            name: user.name,
            email: user.email || '',
            phone: user.phone || '',
          });
        }
      } finally {
        setIsFetching(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, user, form]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPG, PNG, GIF, or WebP image', variant: 'destructive' });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image smaller than 5MB', variant: 'destructive' });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await fileApi.uploadUserAvatar(file);
      const newAvatarUrl = `${getBaseUrl()}${result.url}`;
      setAvatarUrl(newAvatarUrl);
      updateUser({ avatarUrl: result.url });
      toast({ title: 'Avatar updated', description: 'Your profile photo has been updated.' });
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Could not upload avatar. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (!avatarUrl) return;

    setIsUploadingAvatar(true);
    try {
      await fileApi.deleteUserAvatar();
      setAvatarUrl(null);
      updateUser({ avatarUrl: undefined });
      toast({ title: 'Avatar removed', description: 'Your profile photo has been removed.' });
    } catch (error) {
      toast({ title: 'Delete failed', description: 'Could not remove avatar. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await userApi.updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      setProfileData(data);
      setIsEditing(false);

      // Update the auth context with new user data
      updateUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });

      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not update profile', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      form.reset(profileData);
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="container max-w-2xl px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your personal information
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative group flex-shrink-0">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={profileData?.name} />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl md:text-2xl">
                      {profileData?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isUploadingAvatar ? (
                      <Loader2 className="h-5 w-5 md:h-6 md:w-6 text-white animate-spin" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        <Camera className="h-5 w-5 md:h-6 md:w-6" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg md:text-xl truncate">{profileData?.name}</CardTitle>
                  <CardDescription className="text-xs md:text-sm truncate">{profileData?.email}</CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="text-xs md:text-sm"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Camera className="mr-1 h-3 w-3" />
                      )}
                      <span className="hidden xs:inline">{avatarUrl ? 'Change' : 'Upload'} Photo</span>
                      <span className="xs:hidden">{avatarUrl ? 'Change' : 'Upload'}</span>
                    </Button>
                    {avatarUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAvatarDelete}
                        disabled={isUploadingAvatar}
                        className="text-destructive hover:text-destructive text-xs md:text-sm"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        <span className="hidden xs:inline">Remove</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            {isEditing ? (
              <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      {...form.register('name')}
                      className="h-11 pl-10"
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      className="h-11 pl-10"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      {...form.register('phone')}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 py-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{profileData?.name}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3 py-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profileData?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3 py-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{profileData?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4 md:mt-6">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-destructive text-lg md:text-xl">Sign Out</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Sign out of your account on this device
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

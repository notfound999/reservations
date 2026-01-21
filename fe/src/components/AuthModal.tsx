import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import {SignInRequest, UserRequest} from "@/lib/types.ts"; // Ensure this path is correct

const signInSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AuthModal = ({ open, onOpenChange, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const handleSignIn = async (values: SignInForm) => {
    setIsLoading(true);
    try {
      // Map the form values to the API request
      // We use a clean object to satisfy the 'SignInRequest' type
      const payload: SignInRequest = {
        identifier: values.identifier, // Map identifier to username for Java
        password: values.password
      };

      const response = await authApi.signIn(payload);

      const { token, user } = response;
      login(token, user);

      toast({ title: 'Welcome back!' });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      // error handling
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (values: SignUpForm) => {
    setIsLoading(true);
    try {
      // Map the form values to the clean UserRequest DTO
      const payload: UserRequest = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
      };

      await authApi.signUp(payload);

      toast({ title: 'Success', description: 'Account created! Please sign in.' });
      setMode('signin');
    } catch (error: any) {
      // error handling
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    signInForm.reset();
    signUpForm.reset();
  };

  return (
      <Dialog open={open} onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) resetForms();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {mode === 'signin' ? 'Welcome back' : 'Create an account'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'signin'
                  ? 'Sign in to book services and manage your reservations'
                  : 'Join BookIt to discover and book amazing services'}
            </DialogDescription>
          </DialogHeader>

          {mode === 'signin' ? (
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email or Username</Label>
                  <Input
                      id="identifier"
                      placeholder="johndoe"
                      {...signInForm.register('identifier')}
                      className="h-11"
                  />
                  {signInForm.formState.errors.identifier && (
                      <p className="text-sm text-destructive">{signInForm.formState.errors.identifier.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...signInForm.register('password')}
                      className="h-11"
                  />
                  {signInForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-primary font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </form>
          ) : (
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name (used for username)</Label>
                  <Input
                      id="name"
                      placeholder="John Doe"
                      {...signUpForm.register('name')}
                      className="h-11"
                  />
                  {signUpForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...signUpForm.register('email')}
                      className="h-11"
                  />
                  {signUpForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      {...signUpForm.register('phone')}
                      className="h-11"
                  />
                  {signUpForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      {...signUpForm.register('password')}
                      className="h-11"
                  />
                  {signUpForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...signUpForm.register('confirmPassword')}
                      className="h-11"
                  />
                  {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
          )}
        </DialogContent>
      </Dialog>
  );
};

export default AuthModal;
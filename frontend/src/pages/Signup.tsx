import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Eye, EyeOff, ArrowLeft, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    repeatPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(formData.password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
  ];

  const passwordsMatch = formData.password === formData.repeatPassword && formData.repeatPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call your Spring Boot Register Endpoint
      // Make sure the URL matches your backend port (usually 8080)
      await axios.post("http://localhost:8081/api/auth/signup", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setIsLoading(false);
      toast({
        title: "Account created!",
        description: "Welcome to BookEase. Please log in.",
      });

      // 2. Redirect to login page after success
      navigate("/login");

    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Signup failed",
        description: error.response?.data?.message || "Something went wrong. Is the backend running?",
        variant: "destructive",
      });
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-8">
            <Calendar className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-display font-bold text-primary-foreground mb-6 leading-tight">
            Start your journey with BookEase
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-md">
            Create your account and start managing reservations in minutes.
          </p>
        </div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">BookEase</span>
          </div>

          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Create your account
          </h2>
          <p className="text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-1 mt-2">
                  {passwordRequirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2 text-sm">
                      {req.met ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={req.met ? "text-success" : "text-muted-foreground"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeatPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="repeatPassword"
                  name="repeatPassword"
                  type={showRepeatPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.repeatPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                >
                  {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.repeatPassword && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  {passwordsMatch ? (
                    <>
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-success">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-destructive" />
                      <span className="text-destructive">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              By signing up, you agree to our{" "}
              <button type="button" className="text-primary hover:underline">Terms of Service</button>
              {" "}and{" "}
              <button type="button" className="text-primary hover:underline">Privacy Policy</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

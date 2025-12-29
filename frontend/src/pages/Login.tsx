import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Call your Spring Boot Login Endpoint
      // Make sure the object keys (email/password) match what your Java DTO expects!
      const response = await axios.post("http://localhost:8081/api/auth/signin", {
        identifier: email,
        password: password
      });

      // 2. Save the JWT Token so other pages can use it
      // Usually, Spring Boot returns it as { "token": "eyJ..." }
      const token = response.data.token;
      localStorage.setItem("token", token);

      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // 3. Move to the dashboard
      navigate("/dashboard");

    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.response?.data?.message || "Check your backend connection",
      });
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
            Welcome back to BookEase
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-md">
            Sign in to manage your reservations and grow your business.
          </p>
        </div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24">
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
            Sign in to your account
          </h2>
          <p className="text-muted-foreground mb-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

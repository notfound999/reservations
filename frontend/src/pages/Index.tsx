import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Building2, Users, ArrowRight, Star, CheckCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">BookEase</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="lg">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="gradient" size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Trusted by 10,000+ businesses
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
              Simplify Your
              <span className="text-gradient block">Reservations</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The all-in-one platform for managing appointments, scheduling, and growing your service business. Start for free today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="gradient" size="xl" className="gap-2">
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-24">
            {[
              {
                icon: Building2,
                title: "Multi-Business Support",
                description: "Manage multiple locations and business profiles from one dashboard."
              },
              {
                icon: Clock,
                title: "Smart Scheduling",
                description: "Customizable time slots, buffer times, and automatic booking confirmations."
              },
              {
                icon: Users,
                title: "Team Management",
                description: "Add admins and staff to help manage your business operations."
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="group p-8 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-surface">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Active Businesses" },
              { value: "1M+", label: "Reservations Made" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9★", label: "Customer Rating" }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features to streamline your booking workflow
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Custom service offerings with pricing",
              "Flexible schedule management",
              "Automatic appointment confirmations",
              "Time-off and holiday management",
              "Multi-admin business access",
              "Customer reservation history"
            ].map((benefit, index) => (
              <div 
                key={benefit}
                className="flex items-center gap-4 p-5 rounded-xl bg-card shadow-sm hover:shadow-card transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <span className="text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="relative rounded-3xl bg-gradient-hero p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join thousands of businesses that have streamlined their reservations with BookEase.
              </p>
              <Link to="/signup">
                <Button size="xl" className="bg-card text-foreground hover:bg-card/90">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-foreground">BookEase</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 BookEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

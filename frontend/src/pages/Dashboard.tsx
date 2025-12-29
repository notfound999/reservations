import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Phone, 
  Building2
} from "lucide-react";
import { Business } from "@/types";

// Mock data - replace with API calls
// These are public businesses (not owned by current user)
const publicBusinesses: Business[] = [
  {
    id: "1",
    name: "Serenity Spa & Wellness",
    description: "Premium spa services including massage, facials, and body treatments.",
    address: "123 Wellness Ave, New York, NY",
    phone: "+1 (555) 123-4567",
    ownerId: "user1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Elite Barbershop",
    description: "Classic and modern haircuts for gentlemen of all ages.",
    address: "456 Style St, Brooklyn, NY",
    phone: "+1 (555) 987-6543",
    ownerId: "user2",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Fitness Pro Gym",
    description: "Personal training and group fitness classes available.",
    address: "789 Muscle Blvd, Manhattan, NY",
    phone: "+1 (555) 456-7890",
    ownerId: "user3",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Golden Nails Studio",
    description: "Nail art, manicures, and pedicures by certified technicians.",
    address: "321 Beauty Lane, Queens, NY",
    phone: "+1 (555) 321-0987",
    ownerId: "user4",
    createdAt: new Date().toISOString(),
  },
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBusinesses = publicBusinesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Dashboard" subtitle="Discover and book services">
      <div className="space-y-8 animate-fade-in">
        {/* Search Section */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base rounded-2xl"
          />
        </div>

        {/* Public Businesses Section */}
        <section>
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            Browse Businesses
          </h2>
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No businesses found matching your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBusinesses.map((business, index) => (
                <BusinessCard 
                  key={business.id} 
                  business={business} 
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

interface BusinessCardProps {
  business: Business;
  style?: React.CSSProperties;
}

const BusinessCard = ({ business, style }: BusinessCardProps) => {
  return (
    <Link 
      to={`/business/${business.id}`}
      className="group block animate-slide-up"
      style={style}
    >
      <div className="p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {business.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {business.description}
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{business.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{business.phone}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;

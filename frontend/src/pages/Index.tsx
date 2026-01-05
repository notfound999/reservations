import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BusinessCard from '@/components/BusinessCard';
import { businessApi, offeringsApi } from '@/lib/api';
import type { Business } from '@/lib/types';

const categories = ['All', 'Spa & Wellness', 'Barbershop', 'Beauty Salon', 'Fitness', 'Yoga & Meditation', 'Pet Services'];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [lowestPrices, setLowestPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await businessApi.getAll();
        setBusinesses(data);
        
        // Fetch lowest prices for each business
        const prices: Record<string, number> = {};
        await Promise.all(
          data.map(async (business) => {
            try {
              const offerings = await offeringsApi.getByBusiness(business.id);
              if (offerings.length > 0) {
                prices[business.id] = Math.min(...offerings.map(o => o.price));
              }
            } catch {
              // Silently handle individual business offering fetch errors
            }
          })
        );
        setLowestPrices(prices);
      } catch (err) {
        setError('Failed to load businesses. Please try again.');
        console.error('Error fetching businesses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      const matchesSearch = 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [businesses, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-hero-gradient py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Book services you'll{' '}
              <span className="text-gradient-warm">love</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover and book appointments at the best local businesses. 
              From spas to salons, fitness to pet care – all in one place.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search businesses or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base rounded-xl bg-card shadow-card"
                />
              </div>
              <Button size="lg" className="h-14 px-6 rounded-xl" variant="hero">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Business Grid */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold">
                {selectedCategory === 'All' ? 'Popular Businesses' : selectedCategory}
              </h2>
              <p className="text-muted-foreground">
                {filteredBusinesses.length} businesses available
              </p>
            </div>
            <Button variant="outline" className="gap-2 hidden sm:flex">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  lowestPrice={lowestPrices[business.id]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No businesses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
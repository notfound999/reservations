import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, ChevronLeft, ChevronRight, TrendingUp, Star, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BusinessCard from '@/components/BusinessCard';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
import { businessApi, offeringsApi } from '@/lib/api';
import type { Business } from '@/lib/types';

const categories = ['All', 'Spa & Wellness', 'Barbershop', 'Beauty Salon', 'Fitness', 'Yoga & Meditation', 'Pet Services', 'Other'];

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [lowestPrices, setLowestPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    if (searchFromUrl !== searchQuery) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        setSearchParams({ search: searchQuery });
      } else {
        setSearchParams({});
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, setSearchParams]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await businessApi.getAll();
        setBusinesses(data);

        const prices: Record<string, number> = {};
        await Promise.all(
          data.map(async (business) => {
            try {
              const offerings = await offeringsApi.getByBusiness(business.id);
              if (offerings.length > 0) {
                prices[business.id] = Math.min(...offerings.map(o => o.price));
              }
            } catch {
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
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = searchLower === '' ||
        business.name.toLowerCase().includes(searchLower) ||
        business.description.toLowerCase().includes(searchLower) ||
        (business.category?.toLowerCase().includes(searchLower) ?? false);

      const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [businesses, searchQuery, selectedCategory]);

  const HorizontalBusinessSection = ({ title, icon: Icon, businesses }: { title: string; icon: any; businesses: Business[] }) => {
    if (businesses.length === 0) return null;

    return (
      <section className="py-8 md:py-4">
        <div className="container px-4 md:px-6">
          <div className="flex items-center gap-2 mb-4 md:mb-3">
            <Icon className="h-6 w-6 md:h-5 md:w-5 text-primary" />
            <h2 className="text-2xl md:text-xl font-semibold">{title}</h2>
            <span className="text-muted-foreground ml-2 text-sm">({businesses.length})</span>
          </div>

          <div className="relative group">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory">
              {businesses.map((business) => (
                <div key={business.id} className="flex-none w-[240px] sm:w-[280px] snap-start">
                  <BusinessCard
                    business={business}
                    lowestPrice={lowestPrices[business.id]}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const nearYouBusinesses = useMemo(() => {
    return filteredBusinesses.slice(0, 8);
  }, [filteredBusinesses]);

  const hottestBusinesses = useMemo(() => {
    return [...filteredBusinesses]
      .filter(b => b.rating && b.rating >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8);
  }, [filteredBusinesses]);

  const newBusinesses = useMemo(() => {
    return [...filteredBusinesses].slice(0, 8);
  }, [filteredBusinesses]);

  const popularBusinesses = useMemo(() => {
    return [...filteredBusinesses]
      .filter(b => b.reviewCount && b.reviewCount > 0)
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 8);
  }, [filteredBusinesses]);

  const businessesByCategory = useMemo(() => {
    const grouped: Record<string, Business[]> = {};
    filteredBusinesses.forEach((business) => {
      const cat = business.category || 'Other';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(business);
    });
    return grouped;
  }, [filteredBusinesses]);

  return (
    <div className="min-h-screen pb-24">
      <section className="bg-hero-gradient py-8 md:py-8">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 md:mb-3">
              Book services you'll{' '}
              <span className="text-gradient-warm">love</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-5 md:mb-4">
              Discover and book appointments at the best local businesses.
              From spas to salons, fitness to pet care – all in one place.
            </p>

            <div className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 md:pl-12 h-10 md:h-11 text-sm md:text-base bg-card shadow-card border-0 rounded-full md:border md:rounded-md"
                />
              </div>
              <Button size="lg" className="h-10 md:h-11 px-4 md:px-6 rounded-full md:rounded-md" variant="hero">
                <Search className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-3 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container px-4 md:px-6">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap h-11 md:h-9"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="container px-4 md:px-6 py-12">
          <SkeletonGrid count={6} />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : filteredBusinesses.length > 0 ? (
        <>
          <HorizontalBusinessSection
            title="Near You"
            icon={MapPin}
            businesses={nearYouBusinesses}
          />

          <HorizontalBusinessSection
            title="Hottest"
            icon={TrendingUp}
            businesses={hottestBusinesses}
          />

          <HorizontalBusinessSection
            title="New"
            icon={Sparkles}
            businesses={newBusinesses}
          />

          <HorizontalBusinessSection
            title="Most Popular"
            icon={Star}
            businesses={popularBusinesses}
          />

          {selectedCategory === 'All' && Object.entries(businessesByCategory).map(([category, categoryBusinesses]) => (
            <HorizontalBusinessSection
              key={category}
              title={category}
              icon={Clock}
              businesses={categoryBusinesses.slice(0, 8)}
            />
          ))}
        </>
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
  );
};

export default Index;
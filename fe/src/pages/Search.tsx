import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BusinessCard from '@/components/BusinessCard';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
import { businessApi, offeringsApi } from '@/lib/api';
import type { Business } from '@/lib/types';

const categories = ['All', 'Spa & Wellness', 'Barbershop', 'Beauty Salon', 'Fitness', 'Yoga & Meditation', 'Pet Services', 'Other'];

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [lowestPrices, setLowestPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(true);

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

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleBusinessClick = (businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search businesses, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus
              className="pl-10 pr-10 h-12 text-base bg-secondary/50 border-0 rounded-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Categories Filter */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap h-9 rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="p-4">
        {isLoading ? (
          <SkeletonGrid count={4} />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredBusinesses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-muted-foreground mb-4">
              {filteredBusinesses.length} result{filteredBusinesses.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 gap-4">
              {filteredBusinesses.map((business, index) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BusinessCard
                    business={business}
                    lowestPrice={lowestPrices[business.id]}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : searchQuery ? (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try a different search term or category
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Search for businesses</h3>
            <p className="text-muted-foreground">
              Find spas, salons, fitness centers and more
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

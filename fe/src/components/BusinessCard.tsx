import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBaseUrl } from '@/lib/api';
import type { Business } from '@/lib/types';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

interface BusinessCardProps {
  business: Business;
  lowestPrice?: number;
}

const BusinessCard = ({ business, lowestPrice }: BusinessCardProps) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, freezeOnceVisible: true });

  const imageUrl = business.imageUrl
    ? business.imageUrl.startsWith('http')
      ? business.imageUrl
      : `${getBaseUrl()}${business.imageUrl}`
    : 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop';

  return (
    <Link to={`/business/${business.id}`}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="h-full"
      >
        <Card className="group overflow-hidden cursor-pointer h-full shadow-card hover:shadow-hover transition-shadow duration-300">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {business.category && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Badge
                variant="secondary"
                className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm text-xs px-2 py-0.5"
              >
                {business.category}
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {business.name}
            </h3>
            {business.rating && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-xs font-medium">{business.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1.5">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{business.address}</span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {business.description}
          </p>

          {lowestPrice !== undefined && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">Starting from</span>
              <span className="font-semibold text-base text-primary">
                ${lowestPrice.toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </Link>
  );
};

export default BusinessCard;

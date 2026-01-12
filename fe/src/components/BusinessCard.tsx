import { Link } from 'react-router-dom';
import { MapPin, Star, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Business, Offering } from '@/lib/types';

interface BusinessCardProps {
  business: Business;
  lowestPrice?: number;
}

const BusinessCard = ({ business, lowestPrice }: BusinessCardProps) => {
  const imageUrl = business.imageUrl
    ? business.imageUrl.startsWith('http')
      ? business.imageUrl
      : `http://localhost:8080${business.imageUrl}`
    : 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop';

  return (
    <Link to={`/business/${business.id}`}>
      <Card className="group overflow-hidden cursor-pointer h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {business.category && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
            >
              {business.category}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {business.name}
            </h3>
            {business.rating && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium">{business.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{business.address}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {business.description}
          </p>

          {lowestPrice !== undefined && (
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm text-muted-foreground">Starting from</span>
              <span className="font-semibold text-lg text-primary">
                ${lowestPrice.toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default BusinessCard;

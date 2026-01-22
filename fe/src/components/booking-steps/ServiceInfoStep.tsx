import { Clock } from 'lucide-react';
import type { Offering } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ServiceInfoStepProps {
  offering: Offering;
  businessName: string;
}

const ServiceInfoStep = ({ offering, businessName }: ServiceInfoStepProps) => {
  return (
    <div className="h-full overflow-y-auto px-6 py-8 pb-24 space-y-6">
      {/* Service Name */}
      <div>
        <h2 className="text-2xl font-bold mb-2">{offering.name}</h2>
        <p className="text-muted-foreground">{businessName}</p>
      </div>

      {/* Price & Duration */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span className="text-sm">{offering.durationMinutes} min</span>
        </div>
        <Badge variant="outline" className="text-base font-semibold px-3 py-1">
          ${offering.price.toFixed(2)}
        </Badge>
      </div>

      {/* Description */}
      {offering.description && (
        <div>
          <h3 className="font-semibold mb-2">About this service</h3>
          <p className="text-muted-foreground leading-relaxed">
            {offering.description}
          </p>
        </div>
      )}

      {/* What's Included Section */}
      <div className="bg-accent/30 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold">What's included</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm">
            <span className="text-airbnb-primary mt-0.5">✓</span>
            <span>{offering.durationMinutes} minutes of service</span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="text-airbnb-primary mt-0.5">✓</span>
            <span>Professional service by {businessName}</span>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="text-airbnb-primary mt-0.5">✓</span>
            <span>Instant booking confirmation</span>
          </li>
        </ul>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-muted/50 rounded-xl p-5">
        <h3 className="font-semibold mb-2">Cancellation policy</h3>
        <p className="text-sm text-muted-foreground">
          Free cancellation up to 24 hours before your appointment.
          Cancellations within 24 hours may incur a fee.
        </p>
      </div>
    </div>
  );
};

export default ServiceInfoStep;

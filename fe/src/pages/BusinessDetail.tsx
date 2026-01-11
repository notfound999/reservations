import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Phone, Clock, Star, ChevronLeft,
  Calendar, MessageSquare, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BookingModal from '@/components/BookingModal';
import ReviewModal from '@/components/ReviewModal';
import { businessApi, offeringsApi, reviewsApi } from '@/lib/api';
import type { Business, Offering, Review } from '@/lib/types';
import { format } from 'date-fns';

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      const reviewsData = await reviewsApi.getByBusiness(id);
      setReviews(reviewsData);
    } catch (err) {
      console.warn('Reviews failed to load:', err);
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // 1. Fetch the Essential Data first
        // We keep these together because the page needs them to function
        const [businessData, offeringsData] = await Promise.all([
          businessApi.getById(id),
          offeringsApi.getByBusiness(id),
        ]);

        setBusiness(businessData);
        setOfferings(offeringsData);

        // 2. Fetch Reviews separately so if it fails (403/404),
        // it doesn't crash the whole page
        try {
          const reviewsData = await reviewsApi.getByBusiness(id);
          setReviews(reviewsData);
        } catch (reviewErr) {
          console.warn('Reviews failed to load, but that is fine:', reviewErr);
          setReviews([]); // Set to empty array so the UI doesn't break
        }

      } catch (err) {
        setError('Failed to load business details. Please check if the backend is running.');
        console.error('Critical fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBookService = (offering: Offering) => {
    setSelectedOffering(offering);
    setIsBookingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Business not found'}</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={business.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=600&fit=crop'}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Back Button */}
        <Link to="/">
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 left-4 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="container -mt-24 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Info Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    {business.category && (
                      <Badge variant="secondary" className="mb-2">
                        {business.category}
                      </Badge>
                    )}
                    <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{business.address}</span>
                    </div>
                  </div>
                  
                  {business.rating && (
                    <div className="flex items-center gap-2 bg-accent px-4 py-2 rounded-xl">
                      <Star className="h-5 w-5 fill-primary text-primary" />
                      <span className="font-semibold text-lg">{business.rating}</span>
                      <span className="text-muted-foreground">
                        ({business.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {business.description}
                </p>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{business.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Open 9:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services/Offerings */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Services</h2>
              {offerings.length > 0 ? (
                <div className="space-y-4">
                  {offerings.map((offering) => (
                    <Card key={offering.id} className="overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{offering.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {offering.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{offering.durationMinutes} min</span>
                              </div>
                              <span className="font-semibold text-lg text-primary">
                                ${offering.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleBookService(offering)}
                            variant="warm"
                          >
                            Book
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No services available yet.
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Reviews</h2>
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Write a Review
                </Button>
              </div>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={review.userAvatar} alt={review.userName} />
                            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{review.userName}</span>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(review.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating 
                                      ? 'fill-primary text-primary' 
                                      : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No reviews yet. Be the first to review!
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Book */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-hover">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Quick Book</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a service to book your appointment
                  </p>
                  {offerings.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {offerings.slice(0, 3).map((offering) => (
                          <button
                            key={offering.id}
                            onClick={() => handleBookService(offering)}
                            className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium text-sm">{offering.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {offering.durationMinutes} min
                              </p>
                            </div>
                            <span className="font-semibold text-primary">
                              ${offering.price}
                            </span>
                          </button>
                        ))}
                      </div>
                      <Separator className="my-4" />
                    </>
                  ) : null}
                  <Button className="w-full" variant="hero" size="lg">
                    <Calendar className="mr-2 h-4 w-4" />
                    View All Services
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {business && (
        <BookingModal
          open={isBookingModalOpen}
          onOpenChange={setIsBookingModalOpen}
          offering={selectedOffering}
          businessName={business.name}
          businessId={business.id}
        />
      )}

      {/* Review Modal */}
      {business && (
        <ReviewModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          businessId={business.id}
          businessName={business.name}
          onReviewSubmitted={fetchReviews}
        />
      )}
    </div>
  );
};

export default BusinessDetail;
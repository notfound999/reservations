import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Phone, Clock, Star, ChevronLeft,
  Calendar, MessageSquare, Loader2, Images, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BookingModal from '@/components/BookingModal';
import ReviewModal from '@/components/ReviewModal';
import BusinessGallery from '@/components/BusinessGallery';
import ImageLightbox from '@/components/ImageLightbox';
import { businessApi, offeringsApi, reviewsApi, galleryApi, getBaseUrl } from '@/lib/api';
import type { Business, Offering, Review, BusinessPhoto } from '@/lib/types';
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
  const [galleryPhotos, setGalleryPhotos] = useState<BusinessPhoto[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

        // 2. Fetch Reviews and Gallery separately so if they fail,
        // it doesn't crash the whole page
        try {
          const reviewsData = await reviewsApi.getByBusiness(id);
          setReviews(reviewsData);
        } catch (reviewErr) {
          console.warn('Reviews failed to load, but that is fine:', reviewErr);
          setReviews([]);
        }

        try {
          const photosData = await galleryApi.getPhotos(id);
          setGalleryPhotos(photosData);
        } catch (photoErr) {
          console.warn('Gallery photos failed to load:', photoErr);
          setGalleryPhotos([]);
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

  // Helper to get full image URL
  const getImageUrl = (url: string | undefined, fallback: string) => {
    if (!url) return fallback;
    if (url.startsWith('http')) return url;
    return `${getBaseUrl()}${url}`;
  };

  // Get all photos for gallery (business image + gallery photos)
  const allPhotos = [
    getImageUrl(business?.imageUrl, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=600&fit=crop'),
    ...galleryPhotos.map(photo => getImageUrl(photo.url, ''))
  ].filter(Boolean);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

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
      {/* Gallery Hero */}
      <div className="relative">
        <BusinessGallery
          photos={allPhotos}
          businessName={business.name}
          onImageClick={handleImageClick}
        />
        {/* Back Button - Overlays the gallery */}
        <Link to="/" className="absolute top-4 left-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-background/90 backdrop-blur-sm hover:bg-background"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="container px-4 md:px-6 -mt-16 md:-mt-24 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Business Info Card */}
            <Card className="overflow-hidden shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3 md:gap-4 mb-4">
                  <div>
                    {business.category && (
                      <Badge variant="secondary" className="mb-2 text-xs md:text-sm">
                        {business.category}
                      </Badge>
                    )}
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{business.name}</h1>
                    <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-2">{business.address}</span>
                    </div>
                  </div>

                  {business.rating && (
                    <div className="flex items-center gap-2 bg-accent px-3 md:px-4 py-2 rounded-xl self-start">
                      <Star className="h-4 w-4 md:h-5 md:w-5 fill-primary text-primary" />
                      <span className="font-semibold text-base md:text-lg">{business.rating}</span>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        ({business.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6">
                  {business.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-6 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{business.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Open 9:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            {galleryPhotos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Images className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Gallery</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {galleryPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => handleImageClick(index + 1)}
                    >
                      <img
                        src={getImageUrl(photo.url, '')}
                        alt={photo.caption || 'Gallery photo'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {photo.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm line-clamp-2">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services/Offerings */}
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Services</h2>
              {offerings.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {offerings.map((offering) => (
                    <Card key={offering.id} className="overflow-hidden">
                      <CardContent className="p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base md:text-lg mb-1">{offering.name}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                              {offering.description}
                            </p>
                            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{offering.durationMinutes} min</span>
                              </div>
                              <span className="font-semibold text-base md:text-lg text-primary">
                                ${offering.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleBookService(offering)}
                            variant="airbnb"
                            size="lg"
                            className="w-full sm:w-auto"
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 md:mb-4">
                <h2 className="text-xl md:text-2xl font-semibold">Reviews</h2>
                <Button
                  variant="ghost"
                  className="gap-2 w-full sm:w-auto"
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
            <div className="lg:sticky lg:top-24">
              <Card className="shadow-hover">
                <CardContent className="p-6 md:p-8">
                  <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4">Quick Book</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
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

      {/* Image Lightbox */}
      <ImageLightbox
        photos={allPhotos}
        initialIndex={lightboxIndex || 0}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        businessName={business.name}
      />
    </div>
  );
};

export default BusinessDetail;
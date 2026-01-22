import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BusinessGalleryProps {
  photos: string[];
  businessName: string;
  onImageClick: (index: number) => void;
}

const BusinessGallery = ({ photos, businessName, onImageClick }: BusinessGalleryProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (!photos || photos.length === 0) {
    return (
      <div className="relative h-[40vh] md:h-[50vh] bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative h-[40vh] md:h-[50vh] bg-muted group">
      {/* Embla Carousel */}
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative cursor-pointer"
              onClick={() => onImageClick(index)}
            >
              <img
                src={photo}
                alt={`${businessName} - Image ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Hidden on mobile, shown on desktop */}
      {photos.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity",
              !canScrollPrev && "opacity-0 pointer-events-none"
            )}
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity",
              !canScrollNext && "opacity-0 pointer-events-none"
            )}
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dot Pagination */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {photos.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === selectedIndex
                  ? "bg-white w-6"
                  : "bg-white/60 hover:bg-white/80"
              )}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter - Top Right */}
      {photos.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
          {selectedIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
};

export default BusinessGallery;

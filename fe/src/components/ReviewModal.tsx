import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { reviewsApi } from '@/lib/api';
import AuthModal from './AuthModal';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  businessName: string;
  onReviewSubmitted: () => void;
}

const ReviewModal = ({
  open,
  onOpenChange,
  businessId,
  businessName,
  onReviewSubmitted,
}: ReviewModalProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await reviewsApi.create(businessId, rating, comment);
      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback.',
      });
      onReviewSubmitted();
      handleClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Could not submit review';
      if (message.includes('already reviewed')) {
        toast({
          title: 'Already reviewed',
          description: 'You have already reviewed this business.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    onOpenChange(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // User is now authenticated, they can submit the review
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience at {businessName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Star Rating */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Your Rating
              </Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-muted-foreground">
                  {rating > 0 && (
                    <>
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
                Your Review (optional)
              </Label>
              <Textarea
                id="comment"
                placeholder="Tell others about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || rating === 0}
                className="flex-1"
                variant="hero"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default ReviewModal;

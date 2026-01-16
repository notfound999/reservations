package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.ReviewDTOs.ReviewRequest;
import com.myapp.reservations.DTO.ReviewDTOs.ReviewResponse;
import com.myapp.reservations.Repository.BusinessRepository;
import com.myapp.reservations.Repository.ReviewRepository;
import com.myapp.reservations.Repository.UserRepository;
import com.myapp.reservations.entities.BusinessEntities.Business;
import com.myapp.reservations.entities.Review.Review;
import com.myapp.reservations.entities.User.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public ReviewService(ReviewRepository reviewRepository, BusinessRepository businessRepository,
                         UserRepository userRepository, UserService userService) {
        this.reviewRepository = reviewRepository;
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public List<ReviewResponse> getReviewsByBusiness(UUID businessId) {
        return reviewRepository.findByBusinessIdOrderByCreatedAtDesc(businessId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse createReview(UUID businessId, ReviewRequest request) {
        UUID currentUserId = userService.getCurrentUserId();

        // Check if user already reviewed this business
        if (reviewRepository.existsByBusinessIdAndUserId(businessId, currentUserId)) {
            throw new RuntimeException("You have already reviewed this business");
        }

        Business business = businessRepository.getBusinessById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = new Review();
        review.setBusiness(business);
        review.setUser(user);
        review.setRating(request.rating());
        review.setComment(request.comment());

        reviewRepository.save(review);

        return toResponse(review);
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getBusiness().getId(),
                review.getUser().getId(),
                review.getUser().getName(),
                null, // userAvatar - not implemented yet
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}

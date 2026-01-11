package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.ReviewDTOs.ReviewRequest;
import com.myapp.reservations.DTO.ReviewDTOs.ReviewResponse;
import com.myapp.reservations.Services.ReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/{businessId}")
    public List<ReviewResponse> getReviewsByBusiness(@PathVariable UUID businessId) {
        return reviewService.getReviewsByBusiness(businessId);
    }

    @PostMapping("/{businessId}")
    public ReviewResponse createReview(@PathVariable UUID businessId, @Valid @RequestBody ReviewRequest request) {
        return reviewService.createReview(businessId, request);
    }
}

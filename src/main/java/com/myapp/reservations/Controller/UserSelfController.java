package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.BusinessRequest;
import com.myapp.reservations.DTO.BusinessResponse;
import com.myapp.reservations.DTO.UserRequest;
import com.myapp.reservations.DTO.UserResponse;
import com.myapp.reservations.Services.BusinessService;
import com.myapp.reservations.Services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/me")
@PreAuthorize("hasAnyRole('USER','BUSINESS_OWNER','BUSINESS_ADMIN','ADMIN')")
public class UserSelfController {

    private final UserService userService;
    private final BusinessService businessService;

    @Autowired
    public UserSelfController(UserService userService, BusinessService businessService) {
        this.userService = userService;
        this.businessService = businessService;
    }

    @GetMapping
    public UserResponse getMyProfile() {
        UUID currentUserId = userService.getCurrentUserId();
        return userService.findById(currentUserId);
    }

    @PutMapping
    public void updateMyProfile(@Valid @RequestBody UserRequest userRequest) {
        UUID currentUserId = userService.getCurrentUserId();
        userService.updateUser(currentUserId, userRequest);
    }

    @DeleteMapping
    public void deleteMyProfile() {
        UUID currentUserId = userService.getCurrentUserId();
        userService.deleteUserById(currentUserId);
    }

    @PostMapping("/create/business")
    public BusinessResponse createMyBusiness(@Valid @RequestBody BusinessRequest request) {
        UUID currentUserId = userService.getCurrentUserId();
        return businessService.createBusiness(request, currentUserId);
    }

    @GetMapping("/businesses")
    public List<BusinessResponse> myBusinesses() {
        UUID currentUserId = userService.getCurrentUserId();
        return businessService.getAllBusinessesByUserId(currentUserId);
    }


}


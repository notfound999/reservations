package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.BusinessRequest;
import com.myapp.reservations.DTO.BusinessResponse;
import com.myapp.reservations.Services.BusinessService;
import com.myapp.reservations.Services.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {
    private final BusinessService businessService;
    private final UserService userService;

    public BusinessController(BusinessService businessService , UserService userService) {
        this.businessService = businessService;
        this.userService = userService;
    }

    @GetMapping("")
    public List<BusinessResponse> getAllBusinesses() {
        return businessService.getAllBusinesses();
    }

    @GetMapping("/by-business-id/{id}")
    public BusinessResponse getBusinessById(@PathVariable(value = "id") UUID id) {
        return businessService.getBusinessById(id);
    }

    @GetMapping("/by-business-name/{name}")
    public BusinessResponse getBusinessByName(@PathVariable(value = "name") String b_name) {
        return businessService.getBusinessByName(b_name);
    }

    @GetMapping("/by-business-owners-id/{owner_id}")
    public List<BusinessResponse> getBusinessesByUserId(@PathVariable(value = "owner_id") UUID id) {
        return businessService.getAllBusinessesByUserId(id);
    }

    @PostMapping("/create")
    public BusinessResponse createBusiness(@Valid @RequestBody BusinessRequest business) {
        UUID currentUserId = userService.getCurrentUserId(); // get authenticated user
        return businessService.createBusiness(business, currentUserId);
    }

    @PutMapping("/update/{id}")
    public BusinessResponse update(@PathVariable(value = "id") UUID id, @RequestBody BusinessRequest business) {
        if (business == null || id == null) return null ;
        return businessService.updateBusiness(id, business);
    }

    @DeleteMapping("/{id}")
    public void deleteBusinessById(@PathVariable(value = "id") UUID id) {
        businessService.deleteBusinessById(id);
    }
}

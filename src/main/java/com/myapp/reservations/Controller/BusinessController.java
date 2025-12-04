package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.BusinessDto;
import com.myapp.reservations.Services.BusinessService;
import com.myapp.reservations.entities.Business;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {
    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @GetMapping("")
    public List<BusinessDto> getAllBusinesses() {
        return businessService.getAllBusinesses();
    }

    @GetMapping("/by-business-id/{id}")
    public BusinessDto getBusinessById(@PathVariable(value = "id") UUID id) {
        return businessService.getBusinessById(id);
    }

    @GetMapping("/by-business-name/{name}")
    public BusinessDto getBusinessByName(@PathVariable(value = "name") String b_name) {
        return businessService.getBusinessByName(b_name);
    }

    @GetMapping("/by-business-owners-id/{owner_id}")
    public List<BusinessDto> getBusinessesByUserId(@PathVariable(value = "owner_id") UUID id) {
        return businessService.getAllBusinessesByUserId(id);
    }

    @PostMapping("/create")
    public BusinessDto createBusiness(@RequestBody Business business) {
        return businessService.createBusiness(business);
    }

    @DeleteMapping("/{id}")
    public void deleteBusinessById(@PathVariable(value = "id") UUID id) {
        businessService.deleteBusinessById(id);
    }
}

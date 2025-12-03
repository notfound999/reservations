package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.BusinessDto;
import com.myapp.reservations.Services.BusinessService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/by-Business-Id/{id}")
    public BusinessDto getBusinessById(@PathVariable(value = "id") UUID id) {
        return businessService.getBusinessById(id);
    }

    @GetMapping("/by-Business-Name/{name}")
    public BusinessDto getBusinessByName(@PathVariable(value = "name") String b_name) {
        return businessService.getBusinessByName(b_name);
    }

    @GetMapping("/by-Business-Owners-Id/{owner_id}")
    public List<BusinessDto> getBusinessesByUserId(@PathVariable(value = "owner_id") UUID id) {
        return businessService.getAllBusinessesByUserId(id);
    }
}

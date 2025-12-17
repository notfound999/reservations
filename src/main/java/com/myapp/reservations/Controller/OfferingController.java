package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.ServiceDTOs.OfferingRequest;
import com.myapp.reservations.DTO.ServiceDTOs.OfferingResponse;
import com.myapp.reservations.Services.OfferingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/offerings")
public class OfferingController {

    @Autowired
    private OfferingService offeringService;

    @PostMapping("/{businessId}")
    public OfferingResponse createOffering(@PathVariable("businessId") UUID businessId, @RequestBody OfferingRequest offeringRequest) {
        return offeringService.createService(businessId,offeringRequest);
    }
}

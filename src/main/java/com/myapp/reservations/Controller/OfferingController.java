package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.OfferingDTOs.OfferingRequest;
import com.myapp.reservations.DTO.OfferingDTOs.OfferingResponse;
import com.myapp.reservations.Services.OfferingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/offerings")
public class OfferingController {


    private final OfferingService offeringService;

    public OfferingController(OfferingService offeringService){
        this.offeringService=offeringService;
    }

    @PostMapping("/{businessId}")
    public OfferingResponse createOffering(@PathVariable UUID businessId, @RequestBody OfferingRequest offeringRequest) {
        return offeringService.createService(businessId,offeringRequest);
    }

    @GetMapping("/{offeringId}")
    public OfferingResponse getOfferingById(@PathVariable UUID offeringId){
        return offeringService.getOfferingById(offeringId);
    }

    @GetMapping("/{businessId}")
    public List<OfferingResponse> getBusinessOfferings(@PathVariable UUID businessId){
        return offeringService.getBusinessOfferings(businessId);
    }

    @PutMapping("/update/{offeringId}")
    public OfferingResponse updateOffering(@PathVariable  UUID offeringId , @RequestBody OfferingRequest request){
        return offeringService.updateOffering(offeringId,request);
    }

    @DeleteMapping("/{offeringId}")
    public void deleteOffering(@PathVariable UUID offeringId) {
        offeringService.deleteOfferingId(offeringId);

    }
}

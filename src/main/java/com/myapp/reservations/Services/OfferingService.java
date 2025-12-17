package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.ServiceDTOs.OfferingRequest;
import com.myapp.reservations.DTO.ServiceDTOs.OfferingResponse;
import com.myapp.reservations.Mappers.OfferingMapper;
import com.myapp.reservations.Repository.BusinessRepository;
import com.myapp.reservations.Repository.OfferingRepository;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.BusinessSchedule.Offering;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class OfferingService {

    private final OfferingRepository offeringRepository;
    private final BusinessRepository businessRepository;

    public OfferingService(OfferingRepository offeringRepository, BusinessRepository businessRepository) {
        this.offeringRepository = offeringRepository;
        this.businessRepository = businessRepository;
    }

    @Transactional
    public OfferingResponse createService(@NotNull UUID businessId, @NotNull OfferingRequest offeringRequest) {
        Business business = businessRepository.findById(businessId).orElseThrow();

        Offering offering = OfferingMapper.toOffering(offeringRequest);
        offering.setBusiness(business);

        offeringRepository.save(offering);


        return OfferingMapper.toResponse(offeringRepository.save(offering));
    }
}

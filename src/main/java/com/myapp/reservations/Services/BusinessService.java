package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.BusinessRequest;
import com.myapp.reservations.DTO.BusinessResponse;
import com.myapp.reservations.Mappers.BusinessMapper;
import com.myapp.reservations.Repository.BusinessRepository;
import com.myapp.reservations.Repository.UserRepository;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BusinessService {
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    public BusinessService(BusinessRepository businessRepository, UserRepository userRepository) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
    }

    public BusinessResponse getBusinessById(UUID id) {
        if(id == null) {
            return null;
        }
        Optional<Business> business = businessRepository.findById(id);
        return business.map(BusinessMapper::toResponse).orElse(null);
    }

    public List<BusinessResponse> getAllBusinesses() {
        List<Business> businesses = businessRepository.findAll();
         return businesses.stream().map(BusinessMapper::toResponse).toList();
    }

    public BusinessResponse getBusinessByName(String name) {
        if(name == null) {
            return null;
        }
        Optional<Business> business = businessRepository.getBusinessByName(name);
        return business.map(BusinessMapper::toResponse).orElse(null);
    }

    public List<BusinessResponse> getAllBusinessesByUserId(UUID ownerId) {
        if(ownerId == null) {
            return null;
        }
        Optional<User> user = userRepository.findById(ownerId);
        if (user.isEmpty()) {
            return null;
        }
        List<Business> businesses = businessRepository.getAllBusinessByUserId(user.get().getId());
        return businesses.stream().map(BusinessMapper::toResponse).toList();
    }

    public void deleteBusinessById(UUID id) {
        if(id == null) {
            return;
        }
        businessRepository.deleteById(id);
    }

    @Transactional
    public BusinessResponse createBusiness(BusinessRequest request) {
        if (request == null) return null;

        User owner = userRepository.findById(request.ownerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        List<User> admins = new ArrayList<>();
        if (request.adminIds() != null && !request.adminIds().isEmpty()) {
            admins = userRepository.findAllById(request.adminIds());
        }

        Business business = BusinessMapper.toBusiness(request, owner, admins);

        Business savedBusiness = businessRepository.save(business);

        return BusinessMapper.toResponse(savedBusiness);
    }

    @Transactional
    public BusinessResponse updateBusiness(UUID id, BusinessRequest request) {
        Business existing = businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        if (request.name() != null) existing.setName(request.name());
        if (request.description() != null) existing.setDescription(request.description());
        if (request.address() != null) existing.setAddress(request.address());
        if (request.phone() != null) existing.setPhone(request.phone());

        if (request.ownerId() != null && !request.ownerId().equals(existing.getOwner().getId())) {
            User newOwner = userRepository.findById(request.ownerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            existing.setOwner(newOwner);
        }

        if (request.adminIds() != null) {
            List<User> admins = userRepository.findAllById(request.adminIds());
            existing.setAdmins(admins);
        }

        Business saved = businessRepository.save(existing);
        return BusinessMapper.toResponse(saved);
    }



}

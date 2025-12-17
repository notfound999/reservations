package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.BusinessDTOs.BusinessRequest;
import com.myapp.reservations.DTO.BusinessDTOs.BusinessResponse;
import com.myapp.reservations.DTO.UserDTOs.UserResponse;
import com.myapp.reservations.Mappers.BusinessMapper;
import com.myapp.reservations.Mappers.UserMapper;
import com.myapp.reservations.Repository.BusinessRepository;
import com.myapp.reservations.Repository.UserRepository;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

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
    public BusinessResponse createBusiness(BusinessRequest request, UUID currentUserId) {
        if (request == null) return null;

        // Set owner from current authenticated user
        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Business business = BusinessMapper.toBusiness(request, owner); // no admins here

        Business savedBusiness = businessRepository.save(business);
        if(!owner.getRoles().contains("BUSINESS_OWNER")) {
            owner.getRoles().add("BUSINESS_OWNER");
            userRepository.save(owner);
        }
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

        Business saved = businessRepository.save(existing);
        return BusinessMapper.toResponse(saved);
    }


    @Transactional
    public void addAdminToBusiness(UUID businessId, UUID userId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        business.getAdmins().add(user);
        user.getAdminOfBusinesses().add(business);
        if(user.getRoles().contains("BUSINESS_ADMIN")) {
            user.getRoles().add("BUSINESS_ADMIN");
        }
        userRepository.save(user);
       businessRepository.save(business);
    }

    public List<UserResponse> getAllAdmins(UUID businessId){
        Business business = businessRepository.getBusinessById(businessId).orElseThrow(() -> new RuntimeException("business not found"));
        return business.getAdmins().stream().map(UserMapper::toResponse).toList();
    }
}

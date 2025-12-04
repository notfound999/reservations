package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.BusinessDto;
import com.myapp.reservations.Mappers.BusinessMapper;
import com.myapp.reservations.Repository.BusinessRepository;
import com.myapp.reservations.Repository.UserRepository;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.User;
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

    public BusinessDto getBusinessById(UUID id) {
        if(id == null) {
            return null;
        }
        Optional<Business> business = businessRepository.findById(id);
        return business.map(BusinessMapper::toDto).orElse(null);
    }

    public List<BusinessDto> getAllBusinesses() {
        List<Business> businesses = businessRepository.findAll();
         return businesses.stream().map(BusinessMapper::toDto).toList();
    }

    public BusinessDto getBusinessByName(String name) {
        if(name == null) {
            return null;
        }
        Optional<Business> business = businessRepository.getBusinessByName(name);
        return business.map(BusinessMapper::toDto).orElse(null);
    }

    public List<BusinessDto> getAllBusinessesByUserId(UUID ownerId) {
        if(ownerId == null) {
            return null;
        }
        Optional<User> user = userRepository.findById(ownerId);
        if (user.isEmpty()) {
            return null;
        }
        List<Business> businesses = businessRepository.getAllBusinessByUserId(user.get().getId());
        return businesses.stream().map(BusinessMapper::toDto).toList();
    }

    public void deleteBusinessById(UUID id) {
        if(id == null) {
            return;
        }
        businessRepository.deleteById(id);
    }

    public BusinessDto createBusiness(Business business) {
        if(business == null) {
            return null;
        }
        businessRepository.save(business);
        return BusinessMapper.toDto(business);
    }


}

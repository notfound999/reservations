package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.BusinessRequest;
import com.myapp.reservations.DTO.BusinessResponse;
import com.myapp.reservations.DTO.UserResponse;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.User;

import java.util.ArrayList;
import java.util.List;

public class BusinessMapper {

    public static BusinessResponse toResponse(Business business) {
        if (business == null) return null;

        List<UserResponse> adminResponses = business.getAdmins()
                .stream()
                .map(UserMapper::toResponse)
                .toList();

        return new BusinessResponse(
                business.getId(),
                business.getName(),
                business.getDescription(),
                business.getAddress(),
                business.getPhone(),
                UserMapper.toResponse(business.getOwner()),
                adminResponses,
                business.getCreatedAt(),
                business.getUpdatedAt()
        );
    }

    public static Business toBusiness(BusinessRequest request, User owner, List<User> admins) {
        if (request == null) return null;

        Business business = new Business();
        business.setName(request.name());
        business.setDescription(request.description());
        business.setAddress(request.address());
        business.setPhone(request.phone());
        business.setOwner(owner);
        business.setAdmins(admins != null ? new ArrayList<>(admins) : new ArrayList<>());
        return business;
    }

}

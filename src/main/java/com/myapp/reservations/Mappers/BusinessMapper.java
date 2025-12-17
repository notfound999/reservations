package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.BusinessDTOs.BusinessRequest;
import com.myapp.reservations.DTO.BusinessDTOs.BusinessResponse;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.User;

import java.util.ArrayList;
import java.util.List;

public class BusinessMapper {

    public static BusinessResponse toResponse(Business business) {
        if (business == null) return null;

        return new BusinessResponse(
                business.getId(),
                business.getName(),
                business.getDescription(),
                business.getAddress(),
                business.getPhone(),
                business.getOwner().getId(),
                business.getAdmins().stream()
                        .map(User::getId)
                        .toList(),
                ScheduleMapper.toResponse(business.getScheduleSettings()),
                business.getOfferings().stream()
                        .map(OfferingMapper::toResponse)
                        .toList()

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

    public static Business toBusiness(BusinessRequest request, User owner) {
        return toBusiness(request, owner, new ArrayList<>());
    }

}

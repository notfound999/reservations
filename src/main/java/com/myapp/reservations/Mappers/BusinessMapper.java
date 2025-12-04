package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.BusinessDto;
import com.myapp.reservations.entities.Business;

public class BusinessMapper {

    public static BusinessDto toDto(Business business)
    {
        if(business==null)
        {
            return null;
        }
        return new BusinessDto(business.getId(), business.getName(), business.getDescription(), business.getAddress(), business.getPhone(),business.getOwner(), business.getAdmins());
    }

    public static Business ToBusiness(BusinessDto businessDto){
        if(businessDto==null)
        {
            return null;
        }
        Business business = new Business();
        business.setId(businessDto.id());
        business.setName(businessDto.name());
        business.setDescription(businessDto.description());
        business.setAddress(businessDto.address());
        business.setPhone(businessDto.phone());
        business.setOwner(businessDto.owner());
        business.setAdmins(businessDto.admins());
        return business;
    }

}

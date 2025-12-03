package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.BusinessDto;
import com.myapp.reservations.entities.Business;

import java.util.Optional;

public class BusinessMapper {

    public static BusinessDto toDto(Business business)
    {
        if(business==null)
        {
            return null;
        }
        return new BusinessDto(business.getId(), business.getName(), business.getOwner(), business.getAdmins());
    }

    public static Business ToBusiness(BusinessDto businessDto){
        if(businessDto==null)
        {
            return null;
        }
        Business business = new Business();
        business.setId(businessDto.id());
        business.setName(businessDto.name());
        business.setOwner(businessDto.owner());
        business.setAdmins(businessDto.admins());
        return business;
    }

}

package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.BusinessDTO;
import com.myapp.reservations.entities.Business;

public class BusinessMapper {

    public static BusinessDTO ToDto(Business business)
    {
        if(business==null)
        {
            return null;
        }
        return new BusinessDTO(business.getId(), business.getName(), business.getOwner(), business.getAdmins());
    }

    public static Business ToBusiness(BusinessDTO businessDto){
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

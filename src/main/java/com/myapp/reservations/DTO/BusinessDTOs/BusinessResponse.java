package com.myapp.reservations.DTO.BusinessDTOs;

import com.myapp.reservations.DTO.ScheduleSettingsDTOs.ScheduleSettingsResponse;
import com.myapp.reservations.DTO.TimeOffDTOs.OfferingDTOs.OfferingResponse;
import com.myapp.reservations.entities.BusinessEntities.BusinessType;

import java.util.List;
import java.util.UUID;

public record BusinessResponse(
        UUID id,
        String name,
        String description,
        String address,
        String phone,
        UUID ownerId,
        List<UUID> adminIds,
        ScheduleSettingsResponse schedule,
        List<OfferingResponse> offerings,
        BusinessType businessType,
        String customType,
        String category, // Display name computed from businessType
        String imageUrl
) {}

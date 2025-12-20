package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.ReservationDTOs.ReservationRequest;
import com.myapp.reservations.DTO.ReservationDTOs.ReservationResponse;
import com.myapp.reservations.Repository.ReservationRepository;
import com.myapp.reservations.Repository.ScheduleSettingsRepository;
import com.myapp.reservations.entities.BusinessSchedule.ScheduleSettings;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class ReservationService {

    private ReservationRepository reservationRepository;
    private ScheduleSettingsRepository scheduleSettingsRepository;

    public boolean validateWorkingDay(ReservationRequest reservationRequest){
        if(reservationRequest == null){
            throw new RuntimeException("Request is empty");
        }
        ScheduleSettings settings = scheduleSettingsRepository.getScheduleSettingsByBusinessId(businessId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));


    }

    @Transactional
    public ReservationResponse createReservation(ReservationRequest reservationRequest){
        if(reservationRequest == null){
            throw new RuntimeException("Request is empty");
        }
        if(validateWorkingDay() == false){
            return null;
        }


    }


}

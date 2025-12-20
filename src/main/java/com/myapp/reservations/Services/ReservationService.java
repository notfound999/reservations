package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.ReservationDTOs.ReservationRequest;
import com.myapp.reservations.DTO.ReservationDTOs.ReservationResponse;
import com.myapp.reservations.Repository.*;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.BusinessSchedule.*;
import com.myapp.reservations.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class ReservationService {

    private final BusinessRepository businessRepository;
    private final ReservationRepository reservationRepository;
    private final ScheduleSettingsRepository scheduleSettingsRepository;
    private final OfferingRepository offeringRepository;
    private UserRepository userRepository;

    public ReservationService(BusinessRepository businessRepository , ReservationRepository reservationRepository , ScheduleSettingsRepository scheduleSettingsRepository,OfferingRepository offeringRepository) {
        this.businessRepository = businessRepository;
        this.reservationRepository=reservationRepository;
        this.scheduleSettingsRepository = scheduleSettingsRepository;
        this.offeringRepository = offeringRepository;
    }

    private void validateWorkingHours(ReservationRequest request, ScheduleSettings settings) {
        LocalDateTime start = request.startDateTime();
        DayOfWeek dayOfWeek = start.getDayOfWeek();

        // 1. Get the rules for this specific day
        WorkingDay config = settings.getWorkingDays().stream()
                .filter(wd -> wd.getDayOfWeek().equals(dayOfWeek))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Business is not open on this day"));

        // 2. Check if it's a day off
        if (config.isDayOff()) {
            throw new RuntimeException("The business is closed on " + dayOfWeek);
        }

        // 3. Check if start and end times fall within open hours
        LocalTime requestStart = start.toLocalTime();
        LocalTime requestEnd = request.endDateTime().toLocalTime();

        if (requestStart.isBefore(config.getStartTime()) || requestEnd.isAfter(config.getEndTime())) {
            throw new RuntimeException("Selected time is outside of business working hours");
        }

        // 4. (Optional) Check for lunch break
        if (config.getBreakStartTime() != null && requestStart.isBefore(config.getBreakEndTime()) && requestEnd.isAfter(config.getBreakStartTime())) {
            throw new RuntimeException("Selected time overlaps with a business break");
        }
    }

    @Transactional
    public ReservationResponse createReservation(ReservationRequest reservationRequest){
        if(reservationRequest == null){
            throw new RuntimeException("Request is empty");
        }
        ScheduleSettings schedule = scheduleSettingsRepository.getScheduleSettingsByBusinessId(reservationRequest.businessId())
                .orElseThrow(() -> new RuntimeException("Schedule not found"));


        validateWorkingHours(reservationRequest,schedule);

        Reservation reservation =  new Reservation();
        Business business = businessRepository.getBusinessById(reservationRequest.businessId()).orElseThrow(() ->new RuntimeException("Business Not Found"));
        reservation.setBusiness(business);

        Offering offering = offeringRepository.findById(reservationRequest.serviceId())
                .orElseThrow(() -> new RuntimeException("Service Offering Not Found"));
        reservation.setOffering(offering);

        User user = userRepository.findById(reservationRequest.userId())
                .orElseThrow(() -> new RuntimeException("User Not Found"));
        reservation.setUser(user);

        reservation.setStartDateTime(reservationRequest.startDateTime());
        reservation.setEndDateTime(reservationRequest.endDateTime());
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setCreatedAt(LocalDateTime.now());


    }


}

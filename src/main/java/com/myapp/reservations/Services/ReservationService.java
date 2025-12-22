package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.ReservationDTOs.ReservationRequest;
import com.myapp.reservations.DTO.ReservationDTOs.ReservationResponse;
import com.myapp.reservations.Mappers.ReservationMapper;
import com.myapp.reservations.Repository.*;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.BusinessSchedule.*;
import com.myapp.reservations.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Service
public class ReservationService {

    private final BusinessRepository businessRepository;
    private final ReservationRepository reservationRepository;
    private final ScheduleSettingsRepository scheduleSettingsRepository;
    private final OfferingRepository offeringRepository;
    private final TimeOffRepository timeOffRepository;
    private final UserRepository userRepository;

    public ReservationService(BusinessRepository businessRepository , ReservationRepository reservationRepository , ScheduleSettingsRepository scheduleSettingsRepository,OfferingRepository offeringRepository,UserRepository userRepository,TimeOffRepository timeOffRepository) {
        this.businessRepository = businessRepository;
        this.reservationRepository=reservationRepository;
        this.scheduleSettingsRepository = scheduleSettingsRepository;
        this.offeringRepository = offeringRepository;
        this.timeOffRepository= timeOffRepository;
        this.userRepository = userRepository;
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

        validateAdvanceBookingRequirements(reservationRequest.startDateTime(),schedule);

        Business business = businessRepository.getBusinessById(reservationRequest.businessId()).orElseThrow(()-> new RuntimeException("Business not found"));

        if (reservationRepository.existsOverlap(business.getId(), reservationRequest.startDateTime(), reservationRequest.endDateTime())) {
            throw new RuntimeException("This time slot is already reserved by another customer.");
        }

        if (timeOffRepository.hasTimeOffConflict(business.getId(), reservationRequest.startDateTime(), reservationRequest.endDateTime())) {
            throw new RuntimeException("The business is unavailable during this time (Maintenance/Time Off).");
        }

        Reservation reservation =  new Reservation();
        reservation.setBusiness(business);

        Offering offering = offeringRepository.findById(reservationRequest.serviceId())
                .orElseThrow(() -> new RuntimeException("Service Offering Not Found"));
        reservation.setOffering(offering);

        User user = userRepository.findById(reservationRequest.userId())
                .orElseThrow(() -> new RuntimeException("User Not Found"));
        reservation.setUser(user);

        reservation.setStartDateTime(reservationRequest.startDateTime());
        reservation.setEndDateTime(reservationRequest.endDateTime());

        if (schedule.getAutoConfirmAppointments()==true) {
            reservation.setStatus(ReservationStatus.CONFIRMED);
        } else {
            reservation.setStatus(ReservationStatus.PENDING);
        }
        reservation.setCreatedAt(LocalDateTime.now());

        reservationRepository.save(reservation);

        return ReservationMapper.toResponse(reservation);
    }

    private void validateAdvanceBookingRequirements(LocalDateTime requestedStart, ScheduleSettings settings) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Check Minimum Advance Booking (e.g., Must book at least 2 hours ahead)
        if (settings.getMinAdvanceBookingHours() != null) {
            LocalDateTime earliestAllowed = now.plusHours(settings.getMinAdvanceBookingHours());
            if (requestedStart.isBefore(earliestAllowed)) {
                throw new RuntimeException("This booking is too short-notice. Minimum lead time is "
                        + settings.getMinAdvanceBookingHours() + " hours.");
            }
        }

        // 2. Check Maximum Advance Booking (e.g., Cannot book more than 30 days out)
        if (settings.getMaxAdvanceBookingDays() != null) {
            LocalDateTime latestAllowed = now.plusDays(settings.getMaxAdvanceBookingDays());
            if (requestedStart.isAfter(latestAllowed)) {
                throw new RuntimeException("This date is too far in the future. You can only book up to "
                        + settings.getMaxAdvanceBookingDays() + " days in advance.");
            }
        }

        // 3. Past Date Check (Sanity check)
        if (requestedStart.isBefore(now)) {
            throw new RuntimeException("Cannot create a reservation for a past date.");
        }
    }

    @Transactional
    public void cancelReservation(UUID reservationId) {
        // 1. Find the reservation
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + reservationId));

        // 2. Business Logic: Don't cancel if it's already cancelled
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already cancelled.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);

        // 4. Save
        reservationRepository.save(reservation);
    }


}

package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.ReservationDTOs.ReservationRequest;
import com.myapp.reservations.DTO.ReservationDTOs.ReservationResponse;
import com.myapp.reservations.Mappers.ReservationMapper;
import com.myapp.reservations.Repository.*;
import com.myapp.reservations.entities.BusinessEntities.Business;
import com.myapp.reservations.entities.BusinessSchedule.*;
import com.myapp.reservations.entities.Notification.NotificationType;
import com.myapp.reservations.entities.Reservation.Reservation;
import com.myapp.reservations.entities.Reservation.ReservationStatus;
import com.myapp.reservations.entities.User.User;
import jakarta.transaction.Transactional;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class ReservationService {

    private final BusinessRepository businessRepository;
    private final ReservationRepository reservationRepository;
    private final ScheduleSettingsRepository scheduleSettingsRepository;
    private final OfferingRepository offeringRepository;
    private final TimeOffRepository timeOffRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm");

    public ReservationService(BusinessRepository businessRepository, ReservationRepository reservationRepository,
                              ScheduleSettingsRepository scheduleSettingsRepository, OfferingRepository offeringRepository,
                              UserRepository userRepository, TimeOffRepository timeOffRepository,
                              UserService userService, @Lazy NotificationService notificationService) {
        this.businessRepository = businessRepository;
        this.reservationRepository = reservationRepository;
        this.scheduleSettingsRepository = scheduleSettingsRepository;
        this.offeringRepository = offeringRepository;
        this.timeOffRepository = timeOffRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    private void validateWorkingHours(LocalDateTime startDateTime, LocalDateTime endDateTime, ScheduleSettings settings) {
        DayOfWeek dayOfWeek = startDateTime.getDayOfWeek();

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
        LocalTime requestStart = startDateTime.toLocalTime();
        LocalTime requestEnd = endDateTime.toLocalTime();

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

        // Get the offering first to calculate end time
        Offering offering = offeringRepository.findById(reservationRequest.offeringId())
                .orElseThrow(() -> new RuntimeException("Service Offering Not Found"));

        LocalDateTime startDateTime = reservationRequest.startTime();
        LocalDateTime endDateTime = startDateTime.plusMinutes(offering.getDurationMinutes());

        ScheduleSettings schedule = scheduleSettingsRepository.getScheduleSettingsByBusinessId(reservationRequest.businessId())
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        validateWorkingHours(startDateTime, endDateTime, schedule);

        validateAdvanceBookingRequirements(startDateTime, schedule);

        Business business = businessRepository.getBusinessById(reservationRequest.businessId()).orElseThrow(()-> new RuntimeException("Business not found"));

        if (reservationRepository.existsOverlap(business.getId(), startDateTime, endDateTime)) {
            throw new RuntimeException("This time slot is already reserved by another customer.");
        }

        if (timeOffRepository.hasTimeOffConflict(business.getId(), startDateTime, endDateTime)) {
            throw new RuntimeException("The business is unavailable during this time (Maintenance/Time Off).");
        }

        Reservation reservation =  new Reservation();
        reservation.setBusiness(business);
        reservation.setOffering(offering);

        // Get user from authenticated context
        UUID currentUserId = userService.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));
        reservation.setUser(user);

        reservation.setStartDateTime(startDateTime);
        reservation.setEndDateTime(endDateTime);

        if (schedule.getAutoConfirmAppointments() == true) {
            reservation.setStatus(ReservationStatus.CONFIRMED);
        } else {
            reservation.setStatus(ReservationStatus.PENDING);
        }
        reservation.setCreatedAt(LocalDateTime.now());

        reservationRepository.save(reservation);

        // Send notification to business owner
        String formattedDate = startDateTime.format(DATE_FORMATTER);
        String notificationTitle = schedule.getAutoConfirmAppointments()
                ? "New Reservation Confirmed"
                : "New Reservation Request";
        String notificationMessage = String.format(
                "%s booked '%s' for %s.%s",
                user.getName(),
                offering.getName(),
                formattedDate,
                schedule.getAutoConfirmAppointments() ? "" : " Please review and confirm."
        );
        NotificationType notificationType = schedule.getAutoConfirmAppointments()
                ? NotificationType.SUCCESS
                : NotificationType.INFO;

        notificationService.createNotificationForUser(
                business.getOwner().getId(),
                notificationTitle,
                notificationMessage,
                notificationType,
                "/dashboard"
        );

        // Notify customer if auto-confirmed
        if (schedule.getAutoConfirmAppointments()) {
            notificationService.createNotificationForUser(
                    user.getId(),
                    "Reservation Confirmed",
                    String.format("Your reservation at %s for '%s' on %s has been confirmed.",
                            business.getName(), offering.getName(), formattedDate),
                    NotificationType.SUCCESS,
                    "/reservations"
            );
        }

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
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + reservationId));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already cancelled.");
        }

        UUID currentUserId = userService.getCurrentUserId();
        boolean isCustomer = reservation.getUser().getId().equals(currentUserId);
        boolean isBusinessOwner = reservation.getBusiness().getOwner().getId().equals(currentUserId);

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        String formattedDate = reservation.getStartDateTime().format(DATE_FORMATTER);

        // Notify the other party
        if (isCustomer) {
            // Customer cancelled -> notify business owner
            notificationService.createNotificationForUser(
                    reservation.getBusiness().getOwner().getId(),
                    "Reservation Cancelled",
                    String.format("%s cancelled their reservation for '%s' on %s.",
                            reservation.getUser().getName(),
                            reservation.getOffering().getName(),
                            formattedDate),
                    NotificationType.WARNING,
                    "/dashboard"
            );
        } else if (isBusinessOwner) {
            // Business owner cancelled -> notify customer
            notificationService.createNotificationForUser(
                    reservation.getUser().getId(),
                    "Reservation Cancelled",
                    String.format("Your reservation at %s for '%s' on %s has been cancelled by the business.",
                            reservation.getBusiness().getName(),
                            reservation.getOffering().getName(),
                            formattedDate),
                    NotificationType.ALERT,
                    "/reservations"
            );
        }
    }

    @Transactional
    public ReservationResponse confirmReservation(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        UUID currentUserId = userService.getCurrentUserId();
        if (!reservation.getBusiness().getOwner().getId().equals(currentUserId)) {
            throw new RuntimeException("Only the business owner can confirm reservations");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new RuntimeException("Only pending reservations can be confirmed");
        }

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservationRepository.save(reservation);

        String formattedDate = reservation.getStartDateTime().format(DATE_FORMATTER);

        // Notify customer
        notificationService.createNotificationForUser(
                reservation.getUser().getId(),
                "Reservation Confirmed",
                String.format("Your reservation at %s for '%s' on %s has been confirmed!",
                        reservation.getBusiness().getName(),
                        reservation.getOffering().getName(),
                        formattedDate),
                NotificationType.SUCCESS,
                "/reservations"
        );

        return ReservationMapper.toResponse(reservation);
    }

    @Transactional
    public ReservationResponse rejectReservation(UUID reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        UUID currentUserId = userService.getCurrentUserId();
        if (!reservation.getBusiness().getOwner().getId().equals(currentUserId)) {
            throw new RuntimeException("Only the business owner can reject reservations");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new RuntimeException("Only pending reservations can be rejected");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        String formattedDate = reservation.getStartDateTime().format(DATE_FORMATTER);
        String reasonText = (reason != null && !reason.isBlank()) ? " Reason: " + reason : "";

        // Notify customer
        notificationService.createNotificationForUser(
                reservation.getUser().getId(),
                "Reservation Rejected",
                String.format("Your reservation at %s for '%s' on %s was not approved.%s",
                        reservation.getBusiness().getName(),
                        reservation.getOffering().getName(),
                        formattedDate,
                        reasonText),
                NotificationType.ALERT,
                "/reservations"
        );

        return ReservationMapper.toResponse(reservation);
    }

    public java.util.List<ReservationResponse> getMyReservations(UUID userId) {
        return reservationRepository.findByUserId(userId).stream()
                .map(ReservationMapper::toResponse)
                .toList();
    }

    public java.util.List<ReservationResponse> getReservationsByBusiness(UUID businessId) {
        return reservationRepository.findByBusinessId(businessId).stream()
                .map(ReservationMapper::toResponse)
                .toList();
    }

}

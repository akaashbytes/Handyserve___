package com.handyserve.service;

import com.handyserve.dto.BookingDto;
import com.handyserve.entity.Booking;
import com.handyserve.entity.Booking.BookingStatus;
import com.handyserve.entity.User;
import com.handyserve.exception.ResourceNotFoundException;
import com.handyserve.exception.ValidationException;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.UserRepository;
import com.handyserve.mapper.BookingMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.handyserve.client.AuthFeignClient;
import com.handyserve.client.CommFeignClient;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final AuthFeignClient authFeignClient;
    private final CommFeignClient commFeignClient;

    public BookingService(BookingRepository bookingRepository, 
                          UserRepository userRepository, 
                          AuthFeignClient authFeignClient, 
                          CommFeignClient commFeignClient) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.authFeignClient = authFeignClient;
        this.commFeignClient = commFeignClient;
    }

    @Transactional
    public BookingDto createBooking(BookingDto dto, String customerEmail) {
        User customer = userRepository.findByEmailIgnoreCase(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        User provider = userRepository.findById(dto.getServiceProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (provider.getRole() != User.Role.provider) {
            throw new ValidationException("serviceProviderId", "Target user is not a service provider");
        }

        if (provider.getVerified() == null || !provider.getVerified()) {
            throw new ValidationException("serviceProviderId", "Provider is not verified.");
        }

        if (provider.getBlocked() != null && provider.getBlocked()) {
            throw new ValidationException("serviceProviderId", "Provider account is not active.");
        }

        Booking booking = Booking.builder()
                .service(dto.getService())
                .status(BookingStatus.Requested)
                .date(dto.getDate())
                .time(dto.getTime())
                .amount(dto.getAmount())
                .options(dto.getOptions())
                .customer(customer)
                .customerName(customer.getName())
                .customerCity(customer.getCity())
                .customerLatitude(customer.getLatitude())
                .customerLongitude(customer.getLongitude())
                .customerAddress(customer.getDisplayAddress())
                .provider(provider)
                .providerName(provider.getName())
                .providerCity(provider.getServiceCity())
                .providerLatitude(provider.getLatitude())
                .providerLongitude(provider.getLongitude())
                .build();

        booking = bookingRepository.save(booking);
        return BookingMapper.fromEntity(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getBookings(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> bookings;
        if (user.getRole() == User.Role.customer) {
            bookings = bookingRepository.findByCustomerOrderByCreatedAtDesc(user);
        } else if (user.getRole() == User.Role.provider) {
            bookings = bookingRepository.findByProviderOrderByCreatedAtDesc(user);
        } else {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        }

        return bookings.stream()
                .map(BookingMapper::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDto getBooking(Long id, String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Access check
        if (user.getRole() != User.Role.admin &&
                !booking.getCustomer().getId().equals(user.getId()) &&
                !booking.getProvider().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this booking");
        }

        return BookingMapper.fromEntity(booking);
    }

    @Transactional
    public BookingDto updateBookingStatus(Long id, String statusStr, String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Access check
        if (user.getRole() != User.Role.admin &&
                !booking.getCustomer().getId().equals(user.getId()) &&
                !booking.getProvider().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this booking");
        }

        BookingStatus nextStatus = null;
        for (BookingStatus val : BookingStatus.values()) {
            String normVal = val.name().replace("_", "").toLowerCase();
            String normInput = statusStr.replace("_", "").replace(" ", "").toLowerCase();
            if (normVal.equals(normInput)) {
                nextStatus = val;
                break;
            }
        }
        if (nextStatus == null) {
            throw new RuntimeException("Invalid status value: " + statusStr);
        }

        if (!booking.getStatus().canTransitionTo(nextStatus)) {
            throw new RuntimeException("Invalid status transition from " + booking.getStatus() + " to " + nextStatus);
        }

        booking.setStatus(nextStatus);

        // Additional status logic (e.g. coordinates injection on Accept)
        if (nextStatus == BookingStatus.Accepted) {
            User customer = booking.getCustomer();
            if (customer.getLatitude() != null && customer.getLongitude() != null) {
                booking.setCustomerLatitude(customer.getLatitude());
                booking.setCustomerLongitude(customer.getLongitude());
                booking.setCustomerAddress(customer.getDisplayAddress());
                booking.setCustomerDirectionsUrl(googleMapsSearchUrl(customer.getLatitude(), customer.getLongitude()));
                booking.setNavigationToCustomerUrl(googleMapsDirectionsUrl(customer.getLatitude(), customer.getLongitude()));
            }
        }

        booking = bookingRepository.saveAndFlush(booking);
        if (nextStatus == BookingStatus.Completed || nextStatus == BookingStatus.Cancelled) {
            updateUserStats(booking.getProvider().getId());
            updateUserStats(booking.getCustomer().getId());
        }
        commFeignClient.broadcast("{\"type\":\"booking:status\",\"id\":" + booking.getId() + ",\"status\":\"" + booking.getStatus().name() + "\"}");
        return BookingMapper.fromEntity(booking);
    }

    @Transactional
    public BookingDto patchBooking(Long id, BookingDto partialDto, String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Access check
        if (user.getRole() != User.Role.admin &&
                !booking.getCustomer().getId().equals(user.getId()) &&
                !booking.getProvider().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied to this booking");
        }

        if (partialDto.getProviderLatitude() != null) {
            booking.setProviderLatitude(partialDto.getProviderLatitude());
        }
        if (partialDto.getProviderLongitude() != null) {
            booking.setProviderLongitude(partialDto.getProviderLongitude());
        }
        if (partialDto.getCustomerLatitude() != null) {
            booking.setCustomerLatitude(partialDto.getCustomerLatitude());
        }
        if (partialDto.getCustomerLongitude() != null) {
            booking.setCustomerLongitude(partialDto.getCustomerLongitude());
        }
        if (partialDto.getCustomerAddress() != null) {
            booking.setCustomerAddress(partialDto.getCustomerAddress());
        }
        if (partialDto.getRating() != null) {
            booking.setRating(partialDto.getRating());
        }
        if (partialDto.getPaymentMethod() != null) {
            booking.setPaymentMethod(partialDto.getPaymentMethod());
        }
        if (partialDto.getPaymentId() != null) {
            booking.setPaymentId(partialDto.getPaymentId());
        }

        booking = bookingRepository.save(booking);
        if (partialDto.getProviderLatitude() != null || partialDto.getProviderLongitude() != null) {
            commFeignClient.broadcast("{\"type\":\"provider:location\",\"id\":" + booking.getId() + ",\"providerLatitude\":" + booking.getProviderLatitude() + ",\"providerLongitude\":" + booking.getProviderLongitude() + "}");
        }
        return BookingMapper.fromEntity(booking);
    }

    @Transactional
    public BookingDto rateBooking(Long id, Integer rating, String email) {
        User customer = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Only the booking customer can submit a rating");
        }

        if (booking.getStatus() != BookingStatus.Completed) {
            throw new RuntimeException("Cannot rate a booking that is not completed");
        }

        booking.setRating(rating);
        booking = bookingRepository.saveAndFlush(booking);

        updateUserStats(booking.getProvider().getId());
        updateUserStats(booking.getCustomer().getId());

        return BookingMapper.fromEntity(booking);
    }

    private void updateUserStats(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        if (user.getRole() == User.Role.provider) {
            Double avgRating = bookingRepository.avgRatingByProvider(user.getId()).orElse(0.0);
            long completedCount = bookingRepository.countByProviderAndStatus(user, Booking.BookingStatus.Completed);
            long cancelledCount = bookingRepository.countByProviderAndStatus(user, Booking.BookingStatus.Cancelled);
            long totalCount = completedCount + cancelledCount;

            int reliability = 0;
            if (totalCount > 0) {
                double completionRate = ((double) completedCount / totalCount) * 100.0;
                if (bookingRepository.avgRatingByProvider(user.getId()).isPresent()) {
                    reliability = (int) Math.round(completionRate * 0.5 + (avgRating * 20.0) * 0.5);
                } else {
                    reliability = (int) Math.round(completionRate);
                }
            }
            long reviewsCount = bookingRepository.countByProviderAndStatusAndRatingIsNotNull(user, Booking.BookingStatus.Completed);

            user.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
            user.setReliabilityScore(reliability);
            user.setReviews((int) reviewsCount);
            userRepository.save(user);

        } else if (user.getRole() == User.Role.customer) {
            List<Booking> customerBookings = bookingRepository.findByCustomerOrderByCreatedAtDesc(user);
            List<Booking> completedRated = customerBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Completed && b.getRating() != null)
                .collect(Collectors.toList());

            double avgRating = completedRated.stream()
                .mapToDouble(Booking::getRating)
                .average()
                .orElse(0.0);

            long completedCount = customerBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Completed)
                .count();
            long cancelledCount = customerBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.Cancelled)
                .count();
            long totalCount = completedCount + cancelledCount;

            int reliability = 0;
            if (totalCount > 0) {
                reliability = (int) Math.round(((double) completedCount / totalCount) * 100.0);
            }

            user.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
            user.setReliabilityScore(reliability);
            user.setReviews((int) completedRated.size());
            userRepository.save(user);
        }
    }

    private String googleMapsSearchUrl(double lat, double lon) {
        return "https://www.google.com/maps/search/?api=1&query=" + lat + "," + lon;
    }

    private String googleMapsDirectionsUrl(double lat, double lon) {
        return "https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lon + "&travelmode=driving";
    }
}

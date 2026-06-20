package com.handyserve.mapper;

import com.handyserve.dto.BookingDto;
import com.handyserve.entity.Booking;

public class BookingMapper {
    public static BookingDto fromEntity(Booking booking) {
        if (booking == null) return null;
        return BookingDto.builder()
                .id(booking.getId())
                .service(booking.getService())
                .status(booking.getStatus().name())
                .date(booking.getDate())
                .time(booking.getTime())
                .amount(booking.getAmount())
                .options(booking.getOptions())
                .rating(booking.getRating())
                .invoiceId(booking.getInvoiceId())
                .customerId(booking.getCustomer() != null ? booking.getCustomer().getId() : null)
                .customerName(booking.getCustomerName())
                .customerCity(booking.getCustomerCity())
                .customerLatitude(booking.getCustomerLatitude())
                .customerLongitude(booking.getCustomerLongitude())
                .customerAddress(booking.getCustomerAddress())
                .customerDirectionsUrl(booking.getCustomerDirectionsUrl())
                .navigationToCustomerUrl(booking.getNavigationToCustomerUrl())
                .serviceProviderId(booking.getProvider() != null ? booking.getProvider().getId() : null)
                .providerName(booking.getProviderName())
                .providerCity(booking.getProviderCity())
                .providerLatitude(booking.getProviderLatitude())
                .providerLongitude(booking.getProviderLongitude())
                .providerPhoto(booking.getProvider() != null ? booking.getProvider().getProfilePhoto() : null)
                .paymentMethod(booking.getPaymentMethod())
                .paymentId(booking.getPaymentId())
                .paidAt(booking.getPaidAt())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}

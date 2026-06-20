package com.handyserve.repository.oracle;

import com.handyserve.entity.Booking;
import com.handyserve.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerOrderByCreatedAtDesc(User customer);

    long countByProviderAndStatus(User provider, Booking.BookingStatus status);

    long countByProviderAndStatusAndRatingIsNotNull(User provider, Booking.BookingStatus status);

    @Query("SELECT AVG(b.rating) FROM Booking b WHERE b.provider = :provider AND b.status = 'Completed' AND b.rating IS NOT NULL")
    Optional<Double> avgRatingByProvider(@Param("provider") User provider);
}

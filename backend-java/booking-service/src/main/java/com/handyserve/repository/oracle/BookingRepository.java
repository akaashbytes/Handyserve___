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

    List<Booking> findByProviderOrderByCreatedAtDesc(User provider);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByCustomerAndStatus(User customer, Booking.BookingStatus status);

    List<Booking> findByProviderAndStatus(User provider, Booking.BookingStatus status);

    /** Check leave conflicts: provider has an active booking on a specific date and time */
    boolean existsByProviderAndDateAndTimeAndStatusNotIn(
        User provider, String date, String time, List<Booking.BookingStatus> excludedStatuses
    );

    /** Revenue aggregation for analytics */
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Booking b WHERE b.status = 'Completed'")
    Double totalRevenue();

    @Query("""
        SELECT COALESCE(SUM(b.amount), 0) FROM Booking b
        WHERE b.status = 'Completed' AND b.date LIKE :monthPrefix%
        """)
    Double revenueByMonth(@Param("monthPrefix") String monthPrefix);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.date LIKE :monthPrefix%")
    Long countByMonth(@Param("monthPrefix") String monthPrefix);

    @Query("SELECT b.service, COUNT(b) as cnt FROM Booking b GROUP BY b.service ORDER BY cnt DESC")
    List<Object[]> categoryDemand();

    /** Provider completed jobs count */
    long countByProviderAndStatus(User provider, Booking.BookingStatus status);

    long countByProviderAndStatusAndRatingIsNotNull(User provider, Booking.BookingStatus status);

    /** Average rating for a provider */
    @Query("SELECT AVG(b.rating) FROM Booking b WHERE b.provider.id = :providerId AND b.status = 'Completed' AND b.rating IS NOT NULL")
    Optional<Double> avgRatingByProvider(@Param("providerId") Long providerId);
}

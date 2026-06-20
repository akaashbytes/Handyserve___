package com.handyserve.repository.oracle;

import com.handyserve.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Optional<Payment> findByPaymentId(String paymentId);
}

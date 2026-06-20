package com.handyserve.repository.oracle;

import com.handyserve.entity.LeaveRequest;
import com.handyserve.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByProviderOrderByCreatedAtDesc(User provider);

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveRequest.LeaveStatus status);

    List<LeaveRequest> findAllByOrderByCreatedAtDesc();

    Optional<LeaveRequest> findByProviderAndDateAndStatusIn(
        User provider, String date, List<LeaveRequest.LeaveStatus> statuses
    );
}

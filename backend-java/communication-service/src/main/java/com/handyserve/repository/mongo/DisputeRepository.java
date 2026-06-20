package com.handyserve.repository.mongo;

import com.handyserve.document.Dispute;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeRepository extends MongoRepository<Dispute, String> {
    List<Dispute> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Dispute> findByServiceProviderIdOrderByCreatedAtDesc(Long serviceProviderId);
    List<Dispute> findAllByOrderByCreatedAtDesc();
    List<Dispute> findByStatusOrderByCreatedAtDesc(String status);
    long countByStatus(String status);
}

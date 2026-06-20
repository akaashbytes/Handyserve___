package com.handyserve.repository.mongo;

import com.handyserve.document.ContactRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRequestRepository extends MongoRepository<ContactRequest, String> {
    List<ContactRequest> findAllByOrderByCreatedAtDesc();
    List<ContactRequest> findByStatusOrderByCreatedAtDesc(String status);
}

package com.handyserve.repository.oracle;

import com.handyserve.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    Optional<ApiKey> findByKeyValueAndActiveTrue(String keyValue);
    boolean existsByApiIdentifier(String apiIdentifier);
    Optional<ApiKey> findByApiIdentifier(String apiIdentifier);
}

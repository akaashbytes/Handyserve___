package com.handyserve.repository.oracle;

import com.handyserve.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRoleAndBlockedFalse(User.Role role);

    List<User> findByRoleAndServiceCityIgnoreCaseAndBlockedFalse(User.Role role, String city);

    List<User> findByRoleAndServiceTypeContainingIgnoreCaseAndBlockedFalse(User.Role role, String serviceType);

    @Query("""
        SELECT u FROM User u
        WHERE u.role = :role
          AND u.blocked = false
          AND (:city IS NULL OR UPPER(u.serviceCity) LIKE UPPER(CONCAT('%', :city, '%')))
          AND (:serviceType IS NULL OR UPPER(u.serviceType) LIKE UPPER(CONCAT('%', :serviceType, '%')))
          AND (:search IS NULL OR UPPER(u.name) LIKE UPPER(CONCAT('%', :search, '%'))
               OR UPPER(u.serviceType) LIKE UPPER(CONCAT('%', :search, '%')))
        """)
    List<User> searchProviders(
        @Param("role") User.Role role,
        @Param("city") String city,
        @Param("serviceType") String serviceType,
        @Param("search") String search
    );
    long countByRoleAndBlockedFalse(User.Role role);

    long countByRoleAndVerifiedTrueAndBlockedFalse(User.Role role);

    @Query("SELECT COUNT(DISTINCT u.serviceType) FROM User u WHERE u.role = com.handyserve.entity.User.Role.provider AND u.blocked = false AND u.serviceType IS NOT NULL")
    long countDistinctServiceTypes();
}


package com.handyserve;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.handyserve.repository.oracle.BookingRepository;
import com.handyserve.repository.oracle.UserRepository;

@SpringBootApplication(exclude = {
    MongoAutoConfiguration.class,
    MongoDataAutoConfiguration.class
})
@EnableFeignClients
public class BookingApplication {
    public static void main(String[] args) {
        SpringApplication.run(BookingApplication.class, args);
    }

    @Bean
    public CommandLineRunner testRunner(BookingRepository bookingRepository, UserRepository userRepository) {
        return args -> {
            System.out.println("=== DEBUG: TEST RUNNER STARTING ===");
            userRepository.findById(124L).ifPresent(user -> {
                System.out.println("=== DEBUG: User: " + user.getName() + " (role: " + user.getRole() + ")");
                var avg = bookingRepository.avgRatingByProvider(user.getId());
                System.out.println("=== DEBUG: avgRatingByProvider: " + avg);
                var count = bookingRepository.countByProviderAndStatusAndRatingIsNotNull(user, com.handyserve.entity.Booking.BookingStatus.Completed);
                System.out.println("=== DEBUG: countByProviderAndStatusAndRatingIsNotNull Completed/Rated count: " + count);
                var completedCount = bookingRepository.countByProviderAndStatus(user, com.handyserve.entity.Booking.BookingStatus.Completed);
                System.out.println("=== DEBUG: countByProviderAndStatus Completed count: " + completedCount);
            });
            System.out.println("=== DEBUG: TEST RUNNER ENDING ===");
        };
    }
}

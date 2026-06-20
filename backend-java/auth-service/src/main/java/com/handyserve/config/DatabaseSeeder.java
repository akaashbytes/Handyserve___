package com.handyserve.config;

import com.handyserve.entity.User;
import com.handyserve.repository.oracle.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed admin if not exists
        if (!userRepository.existsByEmailIgnoreCase("admin@handyserve.com")) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@handyserve.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.admin)
                    .avatar("AD")
                    .verified(true)
                    .blocked(false)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded admin user: admin@handyserve.com");
        }

        // Remove hardcoded customer if exists
        userRepository.findByEmailIgnoreCase("arjun@email.com").ifPresent(customer -> {
            try {
                userRepository.delete(customer);
                System.out.println("Removed seeded customer user: arjun@email.com");
            } catch (Exception e) {
                System.out.println("Could not delete customer arjun@email.com due to existing references: " + e.getMessage());
            }
        });

        // Remove hardcoded provider if exists
        userRepository.findByEmailIgnoreCase("ravi@email.com").ifPresent(provider -> {
            try {
                userRepository.delete(provider);
                System.out.println("Removed seeded provider user: ravi@email.com");
            } catch (Exception e) {
                System.out.println("Could not delete provider ravi@email.com due to existing references: " + e.getMessage());
            }
        });
    }
}

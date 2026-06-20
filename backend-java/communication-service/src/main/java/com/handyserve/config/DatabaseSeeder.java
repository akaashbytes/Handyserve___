package com.handyserve.config;

import com.handyserve.entity.PromoCode;
import com.handyserve.repository.oracle.PromoCodeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final PromoCodeRepository promoCodeRepository;

    public DatabaseSeeder(PromoCodeRepository promoCodeRepository) {
        this.promoCodeRepository = promoCodeRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed default Promo Codes if not exist
        if (promoCodeRepository.findByCodeIgnoreCase("SUMMER10").isEmpty()) {
            PromoCode summerPromo = PromoCode.builder()
                    .code("SUMMER10")
                    .label("Summer Special (10% Off)")
                    .type(PromoCode.PromoType.percent)
                    .value(10.0)
                    .active(true)
                    .expiresAt(LocalDateTime.now().plusMonths(3))
                    .build();
            promoCodeRepository.save(summerPromo);
            System.out.println("Seeded promo code: SUMMER10");
        }

        if (promoCodeRepository.findByCodeIgnoreCase("FIRST50").isEmpty()) {
            PromoCode firstPromo = PromoCode.builder()
                    .code("FIRST50")
                    .label("First Booking Reward (Flat ₹50 Off)")
                    .type(PromoCode.PromoType.flat)
                    .value(50.0)
                    .active(true)
                    .expiresAt(LocalDateTime.now().plusMonths(6))
                    .build();
            promoCodeRepository.save(firstPromo);
            System.out.println("Seeded promo code: FIRST50");
        }
    }
}

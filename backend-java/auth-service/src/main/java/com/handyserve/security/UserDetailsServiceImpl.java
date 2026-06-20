package com.handyserve.security;

import com.handyserve.entity.User;
import com.handyserve.repository.oracle.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getBlocked()) {
            throw new UsernameNotFoundException("User account is blocked");
        }

        if (user.getVerified() == null || !user.getVerified()) {
            throw new UsernameNotFoundException("User account is not verified. Please verify your email first.");
        }

        // Map role to Spring Security Authority.
        // Role in User is: enum Role { customer, provider, admin }
        // We will grant both "ROLE_<role>" (so hasRole("admin") works) and "<role>" (so hasAuthority("admin") works)
        String roleName = user.getRole().name(); // "customer", "provider", "admin"
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + roleName);

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }
}

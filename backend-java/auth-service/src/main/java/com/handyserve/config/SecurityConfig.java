package com.handyserve.config;

import com.handyserve.apikey.ApiKeyFilter;
import com.handyserve.security.JwtAuthenticationFilter;
import com.handyserve.security.JwtAuthenticationEntryPoint;
import com.handyserve.security.JwtAccessDeniedHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @org.springframework.beans.factory.annotation.Value("${app.client-origin:http://localhost:5173}")
    private String clientOrigin;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ApiKeyFilter            apiKeyFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler      jwtAccessDeniedHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            ApiKeyFilter apiKeyFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            JwtAccessDeniedHandler jwtAccessDeniedHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.apiKeyFilter = apiKeyFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.jwtAccessDeniedHandler = jwtAccessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                // Public Auth Endpoints
                .requestMatchers(
                    "/api/auth/login", "/api/auth/register", "/api/auth/refresh",
                    "/api/customer/auth/refresh", "/api/auth/public-stats",
                    "/api/auth/verify-otp", "/api/auth/resend-otp",
                    "/api/auth/forgot-password", "/api/auth/reset-password",
                    "/error"
                ).permitAll()
                .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()

                // Nominatim Search Geocoder (Public/Cached)
                .requestMatchers("/api/nominatim/**").permitAll()

                // Public provider listing (for DiscoverPage)
                .requestMatchers(HttpMethod.GET, "/api/providers").permitAll()

                // WebSocket Handshake
                .requestMatchers("/ws/**").permitAll()

                // Static resource endpoints, actuator
                .requestMatchers("/actuator/**").permitAll()

                // Swagger / OpenAPI UI
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                // ADMIN: Full access
                .requestMatchers("/api/analytics/**").hasRole("admin")
                .requestMatchers("/api/contact/**").hasRole("admin")

                // CUSTOMER: Customer APIs only
                .requestMatchers("/api/customer/**").hasRole("customer")

                // PROVIDER: Provider APIs only
                .requestMatchers(HttpMethod.GET, "/api/leave/**").hasAnyRole("customer", "provider", "admin")
                .requestMatchers("/api/leave/**").hasRole("provider")
                .requestMatchers("/api/providers/*/availability").hasRole("provider")
                .requestMatchers("/api/payments/**").hasRole("provider")
                .requestMatchers("/api/bookings/**").hasRole("provider")

                // Onboarding / Role Selection: Accessible to all authenticated users
                .requestMatchers("/api/auth/select-role").hasAnyRole("customer", "provider", "admin")

                // Internal microservice endpoints
                .requestMatchers("/api/auth/internal/**").permitAll()

                // Auth endpoints that require any valid JWT (me, profile, logout, refresh)
                .requestMatchers("/api/auth/**").authenticated()

                // Shared authenticated endpoints (e.g. notifications, disputes, booking chat)
                .requestMatchers("/api/notifications/**").hasAnyRole("customer", "provider", "admin")
                .requestMatchers("/api/disputes/**").hasAnyRole("customer", "provider", "admin")
                .requestMatchers("/api/bookings/*/chat/**").hasAnyRole("customer", "provider", "admin")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(apiKeyFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            clientOrigin,
            clientOrigin.replace("5173", "5174")
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control", "X-Api-Key"));
        config.setExposedHeaders(Collections.singletonList("Set-Cookie"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

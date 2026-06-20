package com.handyserve.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * SpringDoc / Swagger UI configuration.
 * Access at: http://localhost:8081/swagger-ui.html
 *
 * Includes two security schemes:
 *  1. BearerAuth   — JWT token in Authorization header
 *  2. ApiKeyAuth   — X-Api-Key header
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI handyServePro() {
        final String bearerSchemeName = "BearerAuth";
        final String apiKeySchemeName = "ApiKeyAuth";

        return new OpenAPI()
            .info(new Info()
                .title("HandyServe Pro — REST API")
                .version("2.0.0")
                .description(
                    "**Enterprise-grade home services marketplace API.**\n\n" +
                    "### Authentication\n" +
                    "Every protected endpoint requires **both** headers:\n" +
                    "- `Authorization: Bearer <JWT_ACCESS_TOKEN>` — obtain via `/api/auth/login`\n" +
                    "- `X-Api-Key: <COMPONENT_KEY>` — use the key assigned to each feature/button\n\n" +
                    "### Roles\n" +
                    "- `customer` — book services, track providers, make payments\n" +
                    "- `provider` — accept/complete jobs, manage schedule, file disputes\n" +
                    "- `admin`    — full platform management, analytics, approvals\n" +
                    "- `public`   — search providers, submit contact form, view landing stats"
                )
                .contact(new Contact()
                    .name("HandyServe Pro Team")
                    .email("admin@handyserve.com"))
                .license(new License()
                    .name("Academic / Private")
                    .url("http://localhost:5173")))
            .servers(List.of(
                new Server().url("http://localhost:8081").description("Local Development")))
            .addSecurityItem(new SecurityRequirement()
                .addList(bearerSchemeName)
                .addList(apiKeySchemeName))
            .components(new Components()
                .addSecuritySchemes(bearerSchemeName, new SecurityScheme()
                    .name(bearerSchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT access token — obtain from POST /api/auth/login"))
                .addSecuritySchemes(apiKeySchemeName, new SecurityScheme()
                    .name("X-Api-Key")
                    .type(SecurityScheme.Type.APIKEY)
                    .in(SecurityScheme.In.HEADER)
                    .description("Feature-specific API key — see HS_API_KEYS table for all 40 keys")));
    }
}

package com.app.usermanagement.config;

import com.app.usermanagement.security.KeycloakJwtAuthenticationConverter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import java.time.Instant;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final KeycloakJwtAuthenticationConverter jwtAuthenticationConverter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final ObjectMapper objectMapper;

    public SecurityConfig(KeycloakJwtAuthenticationConverter jwtAuthenticationConverter,
                          CorsConfigurationSource corsConfigurationSource,
                          ObjectMapper objectMapper) {
        this.jwtAuthenticationConverter = jwtAuthenticationConverter;
        this.corsConfigurationSource = corsConfigurationSource;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics (documentation, santé, erreurs)
                        .requestMatchers("/actuator/health", "/error", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // Endpoints en lecture accessibles par ADMINISTRATEUR et LECTEUR
                        .requestMatchers(HttpMethod.GET, "/api/users/**").hasAnyRole("ADMINISTRATEUR", "LECTEUR")
                        // Endpoints d'écriture strictement réservés à l'ADMINISTRATEUR
                        .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMINISTRATEUR")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("ADMINISTRATEUR")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/**").hasRole("ADMINISTRATEUR")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMINISTRATEUR")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            Map<String, Object> body = Map.of(
                                    "timestamp", Instant.now().toString(),
                                    "status", HttpServletResponse.SC_UNAUTHORIZED,
                                    "error", "Unauthorized",
                                    "message", "Authentification requise ou jeton JWT manquant/expiré",
                                    "path", request.getRequestURI()
                            );
                            objectMapper.writeValue(response.getOutputStream(), body);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            Map<String, Object> body = Map.of(
                                    "timestamp", Instant.now().toString(),
                                    "status", HttpServletResponse.SC_FORBIDDEN,
                                    "error", "Forbidden",
                                    "message", "Privilèges insuffisants : action réservée au rôle ADMINISTRATEUR",
                                    "path", request.getRequestURI()
                            );
                            objectMapper.writeValue(response.getOutputStream(), body);
                        })
                );

        return http.build();
    }
}

package com.homemanager.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration.
 *
 * In development the Angular frontend runs on http://localhost:4200 and calls the
 * API on http://localhost:8080, so CORS must be enabled for that origin.
 *
 * In production, with Nginx acting as a reverse proxy under the same domain,
 * CORS is not needed (same origin).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}

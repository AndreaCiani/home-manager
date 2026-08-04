package com.homemanager.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configurazione web.
 *
 * In sviluppo il frontend Angular gira su http://localhost:4200 e chiama le API
 * su http://localhost:8080: serve quindi abilitare il CORS per quell'origine.
 *
 * In produzione, con Nginx che fa da reverse proxy sotto lo stesso dominio,
 * il CORS non è necessario (stessa origine).
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

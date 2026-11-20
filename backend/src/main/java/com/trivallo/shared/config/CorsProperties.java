package com.trivallo.shared.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Browser origins allowed to call the API directly (the Angular dev server in development). */
@ConfigurationProperties(prefix = "trivallo.cors")
public record CorsProperties(List<String> allowedOrigins) {

    public CorsProperties {
        allowedOrigins = allowedOrigins == null ? List.of() : List.copyOf(allowedOrigins);
    }
}

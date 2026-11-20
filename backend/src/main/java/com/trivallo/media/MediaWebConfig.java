package com.trivallo.media;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serves uploaded images from disk. File names are unique per upload, so they can be cached
 * for a year. Nginx proxies {@code /media/} here; it could serve the volume directly later.
 */
@Configuration
@RequiredArgsConstructor
public class MediaWebConfig implements WebMvcConfigurer {

    private final MediaProperties properties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String prefix = properties.publicPath().endsWith("/") ? properties.publicPath() : properties.publicPath() + "/";
        registry.addResourceHandler(prefix + "**")
                .addResourceLocations(properties.directory().toAbsolutePath().toUri().toString())
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());
    }
}

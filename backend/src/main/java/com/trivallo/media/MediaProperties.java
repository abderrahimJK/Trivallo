package com.trivallo.media;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.nio.file.Path;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;
import org.springframework.validation.annotation.Validated;

/**
 * Where uploaded images live and how they are exposed.
 *
 * @param directory  folder on disk (a Docker volume in production)
 * @param publicPath URL prefix the files are served under, e.g. {@code /media}
 * @param maxFileSize largest accepted upload
 */
@Validated
@ConfigurationProperties(prefix = "trivallo.media")
public record MediaProperties(
        @NotNull Path directory,
        @NotBlank String publicPath,
        @NotNull DataSize maxFileSize) {
}

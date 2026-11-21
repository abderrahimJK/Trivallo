package com.trivallo.media;

import com.trivallo.shared.exception.RuleViolationException;
import com.trivallo.shared.exception.RuleViolationException.Violation;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores uploaded images on local disk and returns their public URL.
 * File names are generated (UUID + detected extension); the uploader's file name is never
 * used on disk, so it cannot escape the media folder or overwrite another file.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImageStorage {

    private static final Pattern FOLDER = Pattern.compile("[a-z0-9-]+(/[a-z0-9-]+)*");

    private final MediaProperties properties;

    /**
     * Validates and stores an image under {@code folder} (e.g. {@code activities/42}).
     *
     * @return the public URL, e.g. {@code /media/activities/42/3f2c...webp}
     * @throws RuleViolationException when the file is empty, too large or not a supported image
     */
    public String store(MultipartFile file, String folder, String field) {
        if (!FOLDER.matcher(folder).matches()) {
            throw new IllegalArgumentException("Invalid media folder: " + folder);
        }
        ImageFormat format = validate(file, field);
        String fileName = UUID.randomUUID() + "." + format.extension();
        Path directory = properties.directory().resolve(folder);
        try (InputStream content = file.getInputStream()) {
            Files.createDirectories(directory);
            Files.copy(content, directory.resolve(fileName));
        } catch (IOException exception) {
            throw new UncheckedIOException("Could not store image in " + directory, exception);
        }
        String url = publicPrefix() + folder + "/" + fileName;
        log.info("Stored image url={} size={} format={}", url, file.getSize(), format);
        return url;
    }

    /** Deletes a file previously returned by {@link #store}; URLs outside the media folder are ignored. */
    public void delete(String url) {
        if (url == null || !url.startsWith(publicPrefix())) {
            return;
        }
        Path root = properties.directory().toAbsolutePath().normalize();
        Path file = root.resolve(url.substring(publicPrefix().length())).normalize();
        if (!file.startsWith(root)) {
            log.warn("Refused to delete a path outside the media folder: {}", url);
            return;
        }
        try {
            Files.deleteIfExists(file);
            log.info("Deleted image url={}", url);
        } catch (IOException exception) {
            // The database row is already gone; an orphan file is harmless, so log and move on.
            log.warn("Could not delete image file url={}", url, exception);
        }
    }

    ImageFormat validate(MultipartFile file, String field) {
        if (file == null || file.isEmpty()) {
            throw violation(field, "file is empty");
        }
        if (file.getSize() > properties.maxFileSize().toBytes()) {
            throw violation(field, "file is larger than %d MB".formatted(properties.maxFileSize().toMegabytes()));
        }
        try (InputStream content = file.getInputStream()) {
            return ImageFormat.detect(content.readNBytes(ImageFormat.HEADER_LENGTH))
                    .orElseThrow(() -> violation(field, "must be a %s image".formatted(ImageFormat.acceptedList())));
        } catch (IOException exception) {
            throw new UncheckedIOException("Could not read upload", exception);
        }
    }

    private String publicPrefix() {
        String path = properties.publicPath();
        return path.endsWith("/") ? path : path + "/";
    }

    private static RuleViolationException violation(String field, String message) {
        return new RuleViolationException(List.of(new Violation(field, message)));
    }
}

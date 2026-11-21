package com.trivallo.media;

import com.trivallo.shared.exception.RuleViolationException;
import com.trivallo.shared.exception.RuleViolationException.Violation;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores uploaded images on local disk, in every {@link ImageSize}, and returns their public URL.
 * File names are generated (UUID + size + extension); the uploader's file name is never used on
 * disk, so it cannot escape the media folder or overwrite another file.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImageStorage {

    private static final Pattern FOLDER = Pattern.compile("[a-z0-9-]+(/[a-z0-9-]+)*");
    /** A file written by {@link #store}: {@code <uuid>-lg.jpg}; its siblings use the other suffixes. */
    private static final Pattern LARGE_FILE = Pattern.compile("(.+)-" + ImageSize.LARGE.suffix() + "\\.(jpg|png)");

    private final MediaProperties properties;
    private final ImageResizer resizer;

    /**
     * Validates, resizes and stores an image under {@code folder} (e.g. {@code activities/42}).
     *
     * @return the public URL of the largest size, e.g. {@code /media/activities/42/3f2c...-lg.jpg}
     * @throws RuleViolationException when the file is empty, too large or not a readable JPG/PNG
     */
    public String store(MultipartFile file, String folder, String field) {
        if (!FOLDER.matcher(folder).matches()) {
            throw new IllegalArgumentException("Invalid media folder: " + folder);
        }
        ImageFormat format = validate(file, field);
        ImageResizer.ResizedImages resized = resizer.resize(readAll(file), format, field);

        String id = UUID.randomUUID().toString();
        Path directory = properties.directory().resolve(folder);
        List<Path> written = new ArrayList<>();
        try {
            Files.createDirectories(directory);
            for (var entry : resized.files().entrySet()) {
                Path target = directory.resolve(fileName(id, entry.getKey(), resized.extension()));
                Files.write(target, entry.getValue());
                written.add(target);
            }
        } catch (IOException exception) {
            written.forEach(ImageStorage::deleteQuietly);
            throw new UncheckedIOException("Could not store image in " + directory, exception);
        }
        String url = publicPrefix() + folder + "/" + fileName(id, ImageSize.LARGE, resized.extension());
        log.info("Stored image url={} uploadBytes={} format={} storedBytes={}", url, file.getSize(), format,
                resized.files().values().stream().mapToInt(bytes -> bytes.length).sum());
        return url;
    }

    /**
     * Deletes the files behind a URL returned by {@link #store} (every size); URLs outside the
     * media folder are ignored.
     */
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
        Matcher large = LARGE_FILE.matcher(file.getFileName().toString());
        if (large.matches()) {
            for (ImageSize size : ImageSize.values()) {
                deleteQuietly(file.resolveSibling(large.group(1) + "-" + size.suffix() + "." + large.group(2)));
            }
        } else {
            deleteQuietly(file); // uploaded before images were resized
        }
        log.info("Deleted image url={}", url);
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

    private static String fileName(String id, ImageSize size, String extension) {
        return id + "-" + size.suffix() + "." + extension;
    }

    private static byte[] readAll(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException exception) {
            throw new UncheckedIOException("Could not read upload", exception);
        }
    }

    private static void deleteQuietly(Path file) {
        try {
            Files.deleteIfExists(file);
        } catch (IOException exception) {
            // The database row is already gone; an orphan file is harmless, so log and move on.
            log.warn("Could not delete image file {}", file, exception);
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

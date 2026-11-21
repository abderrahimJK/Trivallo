package com.trivallo.media;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.trivallo.shared.exception.RuleViolationException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.unit.DataSize;

class ImageStorageTest {

    @TempDir
    Path mediaDir;

    private ImageStorage storage;

    @BeforeEach
    void setUp() {
        storage = new ImageStorage(new MediaProperties(mediaDir, "/media", DataSize.ofKilobytes(200)), new ImageResizer());
    }

    @Test
    void storesEverySizeUnderAGeneratedNameAndReturnsTheLargeUrl() {
        String url = storage.store(file("../../evil.png", TestImages.jpeg(2000, 1000)), "activities/7", "file");

        assertThat(url).matches("/media/activities/7/[0-9a-f-]{36}-lg\\.jpg");
        for (String suffix : List.of("sm", "md", "lg")) {
            assertThat(stored(url.replace("-lg.", "-" + suffix + "."))).exists();
        }
    }

    @Test
    void detectsTheFormatFromContentNotFromTheFileName() {
        assertThat(storage.store(file("photo.jpg", TestImages.png(50, 50, true)), "cities/1", "file")).endsWith("-lg.png");
    }

    @Test
    void rejectsAFileThatIsNotAnImage() {
        assertThatThrownBy(() -> storage.store(file("script.png", "<?php echo 1;".getBytes()), "cities/1", "file"))
                .isInstanceOf(RuleViolationException.class)
                .hasFieldOrPropertyWithValue("violations",
                        List.of(new RuleViolationException.Violation("file", "must be a JPG or PNG image")));
    }

    @Test
    void rejectsWebp() {
        byte[] webp = {'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'};
        assertThatThrownBy(() -> storage.store(file("a.webp", webp), "cities/1", "file"))
                .isInstanceOf(RuleViolationException.class);
    }

    @Test
    void rejectsAnEmptyFile() {
        assertThatThrownBy(() -> storage.store(file("empty.png", new byte[0]), "cities/1", "file"))
                .isInstanceOf(RuleViolationException.class);
    }

    @Test
    void rejectsAFileAboveTheSizeLimit() {
        byte[] large = Arrays.copyOf(TestImages.png(10, 10, false), 300 * 1024);
        assertThatThrownBy(() -> storage.store(file("large.png", large), "cities/1", "file"))
                .isInstanceOf(RuleViolationException.class);
    }

    @Test
    void refusesAFolderThatCouldLeaveTheMediaDirectory() {
        assertThatThrownBy(() -> storage.store(file("a.jpg", TestImages.jpeg(10, 10)), "../etc", "file"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deletesEverySizeOfAStoredImage() throws IOException {
        String url = storage.store(file("a.jpg", TestImages.jpeg(100, 100)), "activities/7", "file");
        storage.delete(url);
        try (var files = Files.list(mediaDir.resolve("activities/7"))) {
            assertThat(files).isEmpty();
        }
    }

    @Test
    void deletesAFileStoredBeforeResizing() throws IOException {
        Path legacy = Files.createDirectories(mediaDir.resolve("cities/1")).resolve("old.webp");
        Files.writeString(legacy, "x");
        storage.delete("/media/cities/1/old.webp");
        assertThat(legacy).doesNotExist();
    }

    @Test
    void ignoresDeletePathsOutsideTheMediaDirectory() throws IOException {
        Path outside = Files.writeString(mediaDir.getParent().resolve("keep-me.txt"), "x");
        storage.delete("/media/../keep-me.txt");
        assertThat(outside).exists();
        Files.delete(outside);
    }

    private Path stored(String url) {
        return mediaDir.resolve(url.substring("/media/".length()));
    }

    private static MockMultipartFile file(String name, byte[] content) {
        return new MockMultipartFile("file", name, "image/jpeg", content);
    }
}

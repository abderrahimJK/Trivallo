package com.trivallo.media;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.trivallo.shared.exception.RuleViolationException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.unit.DataSize;

class ImageStorageTest {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0, 0, 13};
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 16, 'J', 'F', 'I', 'F', 0, 1};
    private static final byte[] WEBP = {'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'};

    @TempDir
    Path mediaDir;

    private ImageStorage storage;

    @BeforeEach
    void setUp() {
        storage = new ImageStorage(new MediaProperties(mediaDir, "/media", DataSize.ofKilobytes(1)));
    }

    @Test
    void storesAPngUnderAGeneratedNameAndReturnsItsUrl() throws IOException {
        String url = storage.store(file("../../evil.png", PNG), "activities/7", "file");

        assertThat(url).matches("/media/activities/7/[0-9a-f-]{36}\\.png");
        Path stored = mediaDir.resolve(url.substring("/media/".length()));
        assertThat(Files.readAllBytes(stored)).isEqualTo(PNG);
    }

    @Test
    void detectsTheFormatFromContentNotFromTheFileName() {
        assertThat(storage.store(file("photo.png", JPEG), "cities/1", "file")).endsWith(".jpg");
        assertThat(storage.store(file("photo.jpg", WEBP), "cities/1", "file")).endsWith(".webp");
    }

    @Test
    void rejectsAFileThatIsNotAnImage() {
        assertThatThrownBy(() -> storage.store(file("script.png", "<?php echo 1;".getBytes()), "cities/1", "file"))
                .isInstanceOf(RuleViolationException.class)
                .hasFieldOrPropertyWithValue("violations",
                        java.util.List.of(new RuleViolationException.Violation("file", "must be a JPG, PNG, WEBP image")));
    }

    @Test
    void rejectsAnEmptyFile() {
        assertThatThrownBy(() -> storage.store(file("empty.png", new byte[0]), "cities/1", "file"))
                .isInstanceOf(RuleViolationException.class);
    }

    @Test
    void rejectsAFileAboveTheSizeLimit() {
        byte[] large = Arrays.copyOf(PNG, 2048);
        assertThatThrownBy(() -> storage.store(file("large.png", large), "cities/1", "file"))
                .isInstanceOf(RuleViolationException.class);
    }

    @Test
    void refusesAFolderThatCouldLeaveTheMediaDirectory() {
        assertThatThrownBy(() -> storage.store(file("a.png", PNG), "../etc", "file"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deletesAStoredFile() {
        String url = storage.store(file("a.png", PNG), "activities/7", "file");
        storage.delete(url);
        assertThat(mediaDir.resolve(url.substring("/media/".length()))).doesNotExist();
    }

    @Test
    void ignoresDeletePathsOutsideTheMediaDirectory() throws IOException {
        Path outside = Files.writeString(mediaDir.getParent().resolve("keep-me.txt"), "x");
        storage.delete("/media/../keep-me.txt");
        assertThat(outside).exists();
        Files.delete(outside);
    }

    private static MockMultipartFile file(String name, byte[] content) {
        return new MockMultipartFile("file", name, "image/png", content);
    }
}

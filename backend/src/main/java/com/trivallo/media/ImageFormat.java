package com.trivallo.media;

import java.util.Arrays;
import java.util.Optional;

/**
 * Image formats we accept, recognised by their leading "magic" bytes rather than by the file
 * name or the client's Content-Type, both of which the uploader controls.
 */
public enum ImageFormat {
    JPEG("jpg", "image/jpeg"),
    PNG("png", "image/png"),
    WEBP("webp", "image/webp");

    private static final byte[] JPEG_SIGNATURE = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n'};
    private static final byte[] RIFF = {'R', 'I', 'F', 'F'};
    private static final byte[] WEBP_MARKER = {'W', 'E', 'B', 'P'};

    /** Bytes needed to tell every supported format apart. */
    public static final int HEADER_LENGTH = 12;

    private final String extension;
    private final String mediaType;

    ImageFormat(String extension, String mediaType) {
        this.extension = extension;
        this.mediaType = mediaType;
    }

    public String extension() {
        return extension;
    }

    public String mediaType() {
        return mediaType;
    }

    public static Optional<ImageFormat> detect(byte[] header) {
        if (startsWith(header, 0, JPEG_SIGNATURE)) {
            return Optional.of(JPEG);
        }
        if (startsWith(header, 0, PNG_SIGNATURE)) {
            return Optional.of(PNG);
        }
        if (startsWith(header, 0, RIFF) && startsWith(header, 8, WEBP_MARKER)) {
            return Optional.of(WEBP);
        }
        return Optional.empty();
    }

    public static String acceptedList() {
        return String.join(", ", Arrays.stream(values()).map(format -> format.extension.toUpperCase()).toList());
    }

    private static boolean startsWith(byte[] data, int offset, byte[] prefix) {
        if (data == null || data.length < offset + prefix.length) {
            return false;
        }
        for (int i = 0; i < prefix.length; i++) {
            if (data[offset + i] != prefix[i]) {
                return false;
            }
        }
        return true;
    }
}

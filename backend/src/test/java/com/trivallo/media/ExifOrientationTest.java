package com.trivallo.media;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayOutputStream;
import org.junit.jupiter.api.Test;

class ExifOrientationTest {

    @Test
    void readsTheOrientationFromBigEndianExif() {
        assertThat(ExifOrientation.read(jpegWithOrientation(6, false))).isEqualTo(6);
    }

    @Test
    void readsTheOrientationFromLittleEndianExif() {
        assertThat(ExifOrientation.read(jpegWithOrientation(8, true))).isEqualTo(8);
    }

    @Test
    void defaultsToNormalWithoutExif() {
        assertThat(ExifOrientation.read(TestImages.jpeg(10, 10))).isEqualTo(ExifOrientation.NORMAL);
    }

    @Test
    void defaultsToNormalForTruncatedData() {
        byte[] broken = java.util.Arrays.copyOf(jpegWithOrientation(6, false), 20);
        assertThat(ExifOrientation.read(broken)).isEqualTo(ExifOrientation.NORMAL);
    }

    /** SOI + an APP1 segment holding a TIFF header with one IFD entry: Orientation. */
    private static byte[] jpegWithOrientation(int orientation, boolean littleEndian) {
        ByteArrayOutputStream tiff = new ByteArrayOutputStream();
        if (littleEndian) {
            write(tiff, 'I', 'I', 42, 0, 8, 0, 0, 0, 1, 0, 0x12, 0x01, 3, 0, 1, 0, 0, 0, orientation, 0, 0, 0, 0, 0, 0, 0);
        } else {
            write(tiff, 'M', 'M', 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0, 0, 0, 0, 0);
        }
        byte[] body = tiff.toByteArray();
        int length = 2 + 6 + body.length;
        ByteArrayOutputStream jpeg = new ByteArrayOutputStream();
        write(jpeg, 0xFF, 0xD8, 0xFF, 0xE1, length >> 8, length & 0xFF, 'E', 'x', 'i', 'f', 0, 0);
        jpeg.writeBytes(body);
        write(jpeg, 0xFF, 0xDA, 0, 2);
        return jpeg.toByteArray();
    }

    private static void write(ByteArrayOutputStream out, int... bytes) {
        for (int b : bytes) {
            out.write(b);
        }
    }
}

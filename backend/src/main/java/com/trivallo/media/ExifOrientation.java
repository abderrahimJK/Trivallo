package com.trivallo.media;

/**
 * Reads the EXIF orientation tag of a JPEG. Phones store photos sideways and record how to turn
 * them in this tag; ImageIO ignores it, so without this a portrait photo would appear rotated.
 * Any malformed or missing data simply means "no rotation" (1).
 */
final class ExifOrientation {

    static final int NORMAL = 1;

    private static final int ORIENTATION_TAG = 0x0112;
    private static final int START_OF_SCAN = 0xDA;
    private static final int APP1 = 0xE1;

    private ExifOrientation() {
    }

    /** @return 1 to 8 as defined by EXIF; 1 when absent or unreadable */
    static int read(byte[] jpeg) {
        try {
            int offset = 2; // after the SOI marker
            while (offset + 4 <= jpeg.length && (jpeg[offset] & 0xFF) == 0xFF) {
                int marker = jpeg[offset + 1] & 0xFF;
                if (marker == START_OF_SCAN) {
                    return NORMAL;
                }
                int length = u16(jpeg, offset + 2, false);
                if (marker == APP1 && isExifHeader(jpeg, offset + 4)) {
                    return orientationFromTiff(jpeg, offset + 10);
                }
                offset += 2 + length;
            }
        } catch (ArrayIndexOutOfBoundsException malformed) {
            return NORMAL;
        }
        return NORMAL;
    }

    private static boolean isExifHeader(byte[] data, int offset) {
        return data[offset] == 'E' && data[offset + 1] == 'x' && data[offset + 2] == 'i' && data[offset + 3] == 'f'
                && data[offset + 4] == 0 && data[offset + 5] == 0;
    }

    private static int orientationFromTiff(byte[] data, int tiff) {
        boolean littleEndian = data[tiff] == 'I' && data[tiff + 1] == 'I';
        int firstDirectory = tiff + u32(data, tiff + 4, littleEndian);
        int entries = u16(data, firstDirectory, littleEndian);
        for (int i = 0; i < entries; i++) {
            int entry = firstDirectory + 2 + i * 12;
            if (u16(data, entry, littleEndian) == ORIENTATION_TAG) {
                int value = u16(data, entry + 8, littleEndian);
                return value >= 1 && value <= 8 ? value : NORMAL;
            }
        }
        return NORMAL;
    }

    private static int u16(byte[] data, int offset, boolean littleEndian) {
        int a = data[offset] & 0xFF;
        int b = data[offset + 1] & 0xFF;
        return littleEndian ? (b << 8) | a : (a << 8) | b;
    }

    private static int u32(byte[] data, int offset, boolean littleEndian) {
        int high = u16(data, littleEndian ? offset + 2 : offset, littleEndian);
        int low = u16(data, littleEndian ? offset : offset + 2, littleEndian);
        return (high << 16) | low;
    }
}

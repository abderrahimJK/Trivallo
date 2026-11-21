package com.trivallo.media;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import javax.imageio.ImageIO;

/** Small real images, encoded in memory, for the media tests. */
final class TestImages {

    private TestImages() {
    }

    static byte[] jpeg(int width, int height) {
        return encode(solid(width, height, BufferedImage.TYPE_INT_RGB), "jpeg");
    }

    static byte[] png(int width, int height, boolean transparent) {
        BufferedImage image = solid(width, height, transparent ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        return encode(image, "png");
    }

    static BufferedImage read(byte[] data) {
        try {
            return ImageIO.read(new java.io.ByteArrayInputStream(data));
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }

    private static BufferedImage solid(int width, int height, int type) {
        BufferedImage image = new BufferedImage(width, height, type);
        Graphics2D g = image.createGraphics();
        g.setColor(new Color(200, 120, 60, type == BufferedImage.TYPE_INT_ARGB ? 128 : 255));
        g.fillRect(0, 0, width, height);
        g.dispose();
        return image;
    }

    private static byte[] encode(BufferedImage image, String format) {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try {
            ImageIO.write(image, format, bytes);
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
        return bytes.toByteArray();
    }
}

package com.trivallo.media;

import com.trivallo.shared.exception.RuleViolationException;
import com.trivallo.shared.exception.RuleViolationException.Violation;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.EnumMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import org.springframework.stereotype.Component;

/**
 * Turns one upload into the {@link ImageSize} files, with plain Java (ImageIO, no extra library).
 * Re-encoding also strips the photo's metadata, including any GPS position.
 * <ul>
 *   <li>Photos from phones are turned upright using their EXIF orientation.</li>
 *   <li>Images are never enlarged; a small upload gives three files of its own width.</li>
 *   <li>PNGs with transparency stay PNG; everything else becomes JPEG.</li>
 * </ul>
 */
@Component
public class ImageResizer {

    /** Refuses "decompression bombs": tiny files that claim gigantic dimensions. */
    static final long DEFAULT_MAX_PIXELS = 100_000_000L;

    private static final float JPEG_QUALITY = 0.82f;

    private final long maxPixels;

    public ImageResizer() {
        this(DEFAULT_MAX_PIXELS);
    }

    ImageResizer(long maxPixels) {
        this.maxPixels = maxPixels;
    }

    /** The encoded files, by size, and the extension they share ("jpg" or "png"). */
    public record ResizedImages(String extension, Map<ImageSize, byte[]> files) {
    }

    /** @throws RuleViolationException (on {@code field}) when the image is too large or cannot be decoded */
    public ResizedImages resize(byte[] data, ImageFormat format, String field) {
        int orientation = format == ImageFormat.JPEG ? ExifOrientation.read(data) : ExifOrientation.NORMAL;
        BufferedImage image = upright(decode(data, field), orientation);
        boolean keepTransparency = format == ImageFormat.PNG && image.getColorModel().hasAlpha();
        String extension = keepTransparency ? "png" : "jpg";

        Map<ImageSize, byte[]> files = new EnumMap<>(ImageSize.class);
        // Largest first, each next size scaled from the previous one: faster and just as sharp.
        BufferedImage source = image;
        for (ImageSize size : List.of(ImageSize.LARGE, ImageSize.MEDIUM, ImageSize.SMALL)) {
            source = scaleToWidth(source, Math.min(size.maxWidth(), source.getWidth()), keepTransparency);
            files.put(size, keepTransparency ? encodePng(source) : encodeJpeg(source));
        }
        return new ResizedImages(extension, files);
    }

    private BufferedImage decode(byte[] data, String field) {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(data))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw unreadable(field);
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if ((long) width * height > maxPixels) {
                    throw new RuleViolationException(List.of(new Violation(field,
                            "image is too large (%d megapixels maximum)".formatted(maxPixels / 1_000_000))));
                }
                // Huge phone photos are read at a fraction of their size (still at least twice the
                // largest output), which keeps memory use low without visible loss.
                int step = Math.max(1, Math.max(width, height) / (2 * ImageSize.LARGE.maxWidth()));
                ImageReadParam param = reader.getDefaultReadParam();
                param.setSourceSubsampling(step, step, 0, 0);
                return reader.read(0, param);
            } finally {
                reader.dispose();
            }
        } catch (IOException | RuntimeException exception) {
            if (exception instanceof RuleViolationException violation) {
                throw violation;
            }
            throw unreadable(field);
        }
    }

    /** Applies EXIF orientation 1-8: a quarter-turn count, then an optional horizontal mirror. */
    static BufferedImage upright(BufferedImage image, int orientation) {
        int quarterTurns = switch (orientation) {
            case 3, 4 -> 2;
            case 5, 6 -> 1;
            case 7, 8 -> 3;
            default -> 0;
        };
        boolean mirror = orientation == 2 || orientation == 4 || orientation == 5 || orientation == 7;
        if (quarterTurns == 0 && !mirror) {
            return image;
        }
        int w = image.getWidth();
        int h = image.getHeight();
        boolean swap = quarterTurns % 2 == 1;
        int newW = swap ? h : w;
        int newH = swap ? w : h;

        AffineTransform transform = new AffineTransform();
        if (mirror) {
            transform.translate(newW, 0);
            transform.scale(-1, 1);
        }
        switch (quarterTurns) {
            case 1 -> {
                transform.translate(h, 0);
                transform.rotate(Math.PI / 2);
            }
            case 2 -> {
                transform.translate(w, h);
                transform.rotate(Math.PI);
            }
            case 3 -> {
                transform.translate(0, w);
                transform.rotate(-Math.PI / 2);
            }
            default -> {
                // mirror only
            }
        }
        BufferedImage turned = new BufferedImage(newW, newH, imageType(image));
        Graphics2D g = turned.createGraphics();
        g.drawImage(image, transform, null);
        g.dispose();
        return turned;
    }

    /** Halves the image until close to the target, then one smooth final step: sharp and cheap. */
    private static BufferedImage scaleToWidth(BufferedImage image, int targetWidth, boolean alpha) {
        BufferedImage current = image;
        while (current.getWidth() / 2 >= targetWidth) {
            current = draw(current, current.getWidth() / 2, alpha);
        }
        return current.getWidth() == targetWidth && current.getType() == type(alpha)
                ? current
                : draw(current, targetWidth, alpha);
    }

    private static BufferedImage draw(BufferedImage source, int width, boolean alpha) {
        int height = Math.max(1, Math.round((float) source.getHeight() * width / source.getWidth()));
        BufferedImage target = new BufferedImage(width, height, type(alpha));
        Graphics2D g = target.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        if (!alpha) {
            // Transparent pixels of a PNG without real transparency need a background for JPEG.
            g.setColor(java.awt.Color.WHITE);
            g.fillRect(0, 0, width, height);
        }
        g.drawImage(source, 0, 0, width, height, null);
        g.dispose();
        return target;
    }

    private static int type(boolean alpha) {
        return alpha ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
    }

    private static int imageType(BufferedImage image) {
        return image.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
    }

    private static byte[] encodeJpeg(BufferedImage image) {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (MemoryCacheImageOutputStream output = new MemoryCacheImageOutputStream(bytes)) {
            writer.setOutput(output);
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(JPEG_QUALITY);
            writer.write(null, new IIOImage(image, null, null), param);
        } catch (IOException exception) {
            throw new UncheckedIOException("Could not encode JPEG", exception);
        } finally {
            writer.dispose();
        }
        return bytes.toByteArray();
    }

    private static byte[] encodePng(BufferedImage image) {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try {
            ImageIO.write(image, "png", bytes);
        } catch (IOException exception) {
            throw new UncheckedIOException("Could not encode PNG", exception);
        }
        return bytes.toByteArray();
    }

    private static RuleViolationException unreadable(String field) {
        return new RuleViolationException(List.of(new Violation(field, "could not be read as a JPG or PNG image")));
    }
}

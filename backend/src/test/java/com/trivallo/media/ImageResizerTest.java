package com.trivallo.media;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.trivallo.shared.exception.RuleViolationException;
import java.awt.image.BufferedImage;
import org.junit.jupiter.api.Test;

class ImageResizerTest {

    private final ImageResizer resizer = new ImageResizer();

    @Test
    void makesPhoneTabletAndDesktopWidthsKeepingTheAspectRatio() {
        var result = resizer.resize(TestImages.jpeg(3000, 2000), ImageFormat.JPEG, "file");

        assertThat(result.extension()).isEqualTo("jpg");
        assertThat(width(result, ImageSize.LARGE)).isEqualTo(1920);
        assertThat(height(result, ImageSize.LARGE)).isEqualTo(1280);
        assertThat(width(result, ImageSize.MEDIUM)).isEqualTo(1280);
        assertThat(width(result, ImageSize.SMALL)).isEqualTo(640);
        assertThat(height(result, ImageSize.SMALL)).isEqualTo(427);
    }

    @Test
    void neverEnlargesASmallImage() {
        var result = resizer.resize(TestImages.jpeg(800, 600), ImageFormat.JPEG, "file");

        assertThat(width(result, ImageSize.LARGE)).isEqualTo(800);
        assertThat(width(result, ImageSize.MEDIUM)).isEqualTo(800);
        assertThat(width(result, ImageSize.SMALL)).isEqualTo(640);
    }

    @Test
    void keepsTransparentPngsAsPngAndTurnsOpaqueOnesIntoJpeg() {
        assertThat(resizer.resize(TestImages.png(400, 300, true), ImageFormat.PNG, "file").extension()).isEqualTo("png");
        assertThat(resizer.resize(TestImages.png(400, 300, false), ImageFormat.PNG, "file").extension()).isEqualTo("jpg");
    }

    @Test
    void refusesImagesAboveThePixelLimit() {
        ImageResizer strict = new ImageResizer(1_000_000);
        assertThatThrownBy(() -> strict.resize(TestImages.jpeg(1200, 1000), ImageFormat.JPEG, "file"))
                .isInstanceOf(RuleViolationException.class);
    }

    @Test
    void refusesAFileWithAValidHeaderButBrokenContent() {
        byte[] truncated = java.util.Arrays.copyOf(TestImages.png(200, 200, false), 40);
        assertThatThrownBy(() -> resizer.resize(truncated, ImageFormat.PNG, "file"))
                .isInstanceOf(RuleViolationException.class);
    }

    @Test
    void turnsAPhoneLandscapeBufferUprightForOrientationSix() {
        BufferedImage sideways = new BufferedImage(40, 20, BufferedImage.TYPE_INT_RGB);
        BufferedImage upright = ImageResizer.upright(sideways, 6);
        assertThat(upright.getWidth()).isEqualTo(20);
        assertThat(upright.getHeight()).isEqualTo(40);
    }

    @Test
    void orientationSixRotatesClockwise() {
        BufferedImage image = new BufferedImage(2, 1, BufferedImage.TYPE_INT_RGB);
        image.setRGB(0, 0, 0xFF0000); // red at the left
        BufferedImage turned = ImageResizer.upright(image, 6);
        // A quarter turn clockwise puts the left pixel at the top.
        assertThat(turned.getRGB(0, 0) & 0xFFFFFF).isEqualTo(0xFF0000);
        assertThat(turned.getRGB(0, 1) & 0xFFFFFF).isZero();
    }

    private static int width(ImageResizer.ResizedImages result, ImageSize size) {
        return TestImages.read(result.files().get(size)).getWidth();
    }

    private static int height(ImageResizer.ResizedImages result, ImageSize size) {
        return TestImages.read(result.files().get(size)).getHeight();
    }
}

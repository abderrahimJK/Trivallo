package com.trivallo.media;

/**
 * Sizes every uploaded image is saved in. The stored URL points at {@link #LARGE}; the other
 * files sit next to it with their own suffix ({@code <id>-sm.jpg}, {@code <id>-md.jpg}), so the
 * frontend can ask for the size that fits the screen.
 */
public enum ImageSize {
    SMALL("sm", 640),
    MEDIUM("md", 1280),
    LARGE("lg", 1920);

    private final String suffix;
    private final int maxWidth;

    ImageSize(String suffix, int maxWidth) {
        this.suffix = suffix;
        this.maxWidth = maxWidth;
    }

    public String suffix() {
        return suffix;
    }

    /** Images narrower than this are never enlarged. */
    public int maxWidth() {
        return maxWidth;
    }
}

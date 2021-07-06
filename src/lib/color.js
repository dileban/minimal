class Color {
    /**
     * Determines whether the foreground colour must be black or white, to
     * best contrast with the given background color.
     * See https://stackoverflow.com/a/41491220.
     * @param {string} bgColor Hex representation of background color.
     * @returns {string} Hex representation of foreground color representing
     * either black or white.
     */
    static foregroundColorFromBackground = bgColor => {
        var color =
            bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
        var r = parseInt(color.substring(0, 2), 16); // hexToR
        var g = parseInt(color.substring(2, 4), 16); // hexToG
        var b = parseInt(color.substring(4, 6), 16); // hexToB
        return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "000000" : "ffffff";
    };
}

export { Color };

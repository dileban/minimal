/**
 * Convenience functions for working with URLs.
 */
class Url {
    /**
     * Returns a prettier version of a url by stripping away the scheme.
     * @param {string} url A string representation of a url.
     * @returns {string} A prettier url.
     */
    static prettier(url) {
        return url.replace(/(^\w+:|^)\/\//, "");
    }

    /**
     * Checks if the given url is a valid http url, i.e. with scheme
     * 'http' or 'https'.
     * @param {string} url A string representation of a url.
     * @returns {boolean} True of url is valid, false otherwise.
     */
    static valid(url) {
        var rule = new RegExp(/^(http|https):\/\/[^ "]+$/);
        return rule.test(url);
    }

    /**
     * Strips leading and trailing path separators.
     * @param {string} pathname The pathname component of a url.
     * @returns {string} The stripped pathname.
     */
    static trim(pathname) {
        return pathname.replace(/^\/+|\/+$/g, "");
    }

    /**
     * Joins a url and a pathname component with the url separator ('/').
     * @param {string} url The url to which an additional pathname will be appended.
     * @param {string} pathname The pathname to append to the url.
     * @returns {string} A url and pathname component appended with a url path separator.
     */
    static join(url, pathname) {
        return Url.trim(url) + "/" + pathname;
    }
}

export default Url;

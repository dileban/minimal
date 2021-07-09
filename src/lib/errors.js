/**
 * Formats an error message that is easier to understand by providing
 * more context to users.
 * @param {Object} err An error instance
 * @returns {string} A meaningful error message that provides more 
 * context to users.
 */
const formatError = (err) => {
    let message;
    switch (err.name) {
        case "HttpError":
            message = formatTypeHttpError(err);
            break;
        default:
            message = formatTypeError(err);
    }
    return message;
}

/**
 * Formats errors of type HttpError. The message returned is easier to 
 * understand and provides more context to users.
 * @param {Object} err An HttpError instance
 * @returns {string} A meaningful error message that provides more 
 * context to users.
 */
const formatTypeHttpError = (err) => {
    let message = "Github: ";
    switch (err.message) {
        case "Not Found":
            message += "Repository not found";
            break;
        case "Bad credentials":
            message += "Bad credentials, use a valid access token";
            break;
        case "":
            message += "Unknown server error";
            break;
        default:
            if (/DOCTYPE html/.test(err.message))
                message += "Unknown server error";
            else
                message += err.message;
    }
    return message;
}

/**
 * Formats errors of type Error. The message returned is easier to 
 * understand and provides more context to users.
 * @param {Object} err An Error instance
 * @returns {string} A meaningful error message that provides more 
 * context to users.
 */
const formatTypeError = (err) => {
    let message;
    switch (true) {
        case /Cannot access contents of url ""/.test(err.message):
            // Full message: Cannot access contents of url "". Extension manifest must request permission to access this host.
            message = "Some tabs are currently inaccessible, try reloading";
            break;
        default:
            message = err.message;
    }
    return message;
}

export default formatError;



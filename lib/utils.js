/**
 * @module utils
 * @ignore
 */

"use strict";

/**
 * Converts the input to a string, then
 * removes leading "0x" if it has any.
 * 
 * @param {any} val The input
 */
function remove0x(val) {
    if (val === undefined || val === null ) return "";
    var str = val.toString();
    if (str.startsWith("0x")) {
        return str.slice(2);
    }
    return str;
}

/**
 * Adds a leading "0x" to a string if it doesn't have already
 * 
 * @param {String} str The string
 */
function add0x(str) {
    if (!str.startsWith("0x")) {
        return "0x" + str;
    }
    return str;
}

/**
 * Removes enclosing double quotes from a string
 * 
 * @param {String} str The string
 * @returns {String} The string without enclosing double quotes
 */
function removeEnclosingDQuotes(str) {
    return str.replace(/^"(.*)"$/, '$1');
}

/**
 * Logs relevant information from a failed http response.
 * 
 * @param {Object} response The response object
 * @param {Object} body The body of the response
 * @param {Object} options Options object of the request
 */
function logFailedResponse(response, body, options) {
    console.log("Request failed");
    console.log("StatusCode: " + response.statusCode);
    console.log("StatusMessage: " + response.statusMessage);
    console.log("Body: " + body);
    console.log("Request options: " + JSON.stringify(options));
}

/**
 * Logs the error object.
 * 
 * @param {Error} e Error object
 */
function logError(e) {
    console.log("Error:");
    console.log(e);
}

module.exports = {
    remove0x,
    add0x,
    removeEnclosingDQuotes,
    logFailedResponse,
    logError
}
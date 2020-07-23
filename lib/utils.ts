/**
 * @module utils
 */

import { AxiosResponse } from 'axios';

/**
 * @description Removes leading "0x" pefix from a string if it has any.
 *
 * @param {string} val The input string.
 * @returns {string} The string without 0x prefix.
 */
export function remove0x(val: string): string {
    if (!val) return '';
    return val.startsWith('0x') ? val.slice(2) : val;
}

/**
 * @description Adds a leading "0x" prefix to a string if it doesn't have already.
 *
 * @param {string} str The string
 */
export function ensure0x(str: string): string {
    return str.startsWith('0x') ? str : `0x${str}`;
}

/**
 * @description Removes enclosing double quotes from a string. Used for formatting messages coming from the Secret Store nodes.
 *
 * @param {string} str The string to format.
 * @returns {string} The string without enclosing double quotes.
 */
export function removeEnclosingDQuotes(str: string): string {
    return str.replace(/^"(.*)"$/, '$1');
}

/**
 * @description Logs relevant information from a failed http response.
 *
 * @param {function(any[]): void} logFunction Log function to use with the error message.
 * @param {AxiosResponse} response The response object.
 */
export function logFailedResponse(logFunction: (...vals: any[]) => void, response: AxiosResponse): void {
    logFunction('Request failed');
    logFunction(`StatusCode: ${response.status}`);
    logFunction(`StatusMessage:  ${response.statusText}`);
    logFunction(`Body: ${response.data}`);
    logFunction(`Request options: ${JSON.stringify(response.config)}`);
}

/**
 * @description Logs the error object. Only stringifies the input.
 *
 * @param {function(any[]): void} logFunction Log function to use with the error message.
 * @param {any} e Error object or message.
 */
export function logError(logFunction: (...vals: any[]) => void, e: any): void {
    logFunction('Error:');
    logFunction(JSON.stringify(e));
}

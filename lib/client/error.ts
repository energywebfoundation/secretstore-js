/**
 * Thrown when an error has occured during the Secret Store session.
 *
 * @memberof module:secretstore/session
 * @class
 */
export class SecretStoreSessionError extends Error {
    response: string;

    /**
     * @constructor
     * @param {string} message The error message.
     * @param {any} response The response object.
     */
    constructor(message: string, response: any) {
        super(message);
        this.response = JSON.stringify(response);
        this.name = 'SecretStoreSessionError';
    }
}

/**
 * @description Thrown when an error has occured during the Secret Store session.
 *
 * @memberof module:secretstore/session
 * @class
 */
export class SecretStoreSessionError extends Error {
    meta: any;

    /**
     * @param {string} message The error message.
     * @param {any} meta Some information object to help debugging
     */
    constructor(message: string, meta: any) {
        super(message);
        this.meta = meta;
        this.name = 'SecretStoreSessionError';
    }
}

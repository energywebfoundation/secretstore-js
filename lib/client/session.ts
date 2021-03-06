/** @module client/session */

import axios, { Method, AxiosError, AxiosRequestConfig } from 'axios';
import { remove0x, removeEnclosingDQuotes } from '../utils';
import { SecretStoreSessionError } from './error';
import { ExternallyEncryptedDocumentKey } from './rpc';

/**
 * @description Holds together portions of a shadow retrieved document key
 *
 * @memberof module:client/session
 * @interface
 */
export interface DocumentKeyPortions {
    common_point: string;
    decrypted_secret: string;
    decrypt_shadows: string[];
}

/**
 * @description Client for Secret Store session API. Uses [axios]{@link https://github.com/axios/axios}
 * for making requests which is freely configurable.
 *
 * @memberof module:client/session
 * @class
 */
export class SecretStoreSessionClient {
    url: string;

    requestConfig: AxiosRequestConfig;

    /**
     * @param {string} ssEndpointUrl The endpoint URL where a Secret Store node is listening for incoming session requests.
     * @param {AxiosRequestConfig} [requestConfig] Additional request configuration params. Note: 'url', 'method' and 'data'
     * fields are overwritten.
     */
    constructor(ssEndpointUrl: string, requestConfig: AxiosRequestConfig = {}) {
        if (!ssEndpointUrl) {
            throw new Error(`Secret Store endpoint URL was not given`);
        }
        this.url = ssEndpointUrl.endsWith('/') ? ssEndpointUrl.slice(0, -1) : ssEndpointUrl;
        this.requestConfig = requestConfig;
    }

    private async _send<T>(method: Method, url: string, body: any = undefined): Promise<T> {
        try {
            const response = await axios({
                ...this.requestConfig,
                url,
                method,
                data: body
            });
            return response.data as T;
        } catch (error) {
            if ((error as AxiosError).isAxiosError) {
                const { response } = error as AxiosError;
                throw new SecretStoreSessionError(
                    `${response.statusText} (${response.status}): ${removeEnclosingDQuotes(response.data)}`,
                    response.config
                );
            }
            throw error;
        }
    }

    /**
     * @description Generates server keys.
     *
     * More information can be found [here]{@link https://openethereum.github.io/wiki/Secret-Store.html#server-key-generation-session}.
     *
     * @param {string} serverKeyID The server key ID of your choosing. If you’re planning to link document key to this server key later,
     * it would be good to use document contents hash as this identifier. Otherwise, it could be a random value.
     * In both cases, please note that this value is unique and cannot be changed later.
     * @param {string} signedServerKeyID The server key ID, signed with author’s private key. Only the author of a server key could bind
     * document key to this server key later. This signature could be generated by `secretstore_signRawHash` RPC method.
     * @param {number} threshold The key threshold value. Please consider the
     * [guidelines]{@link https://openethereum.github.io/wiki/Secret-Store.html#server-key-generation-session} when choosing this value.
     * @returns {Promise<string>} The hex-encoded public portion of the server key.
     */
    async generateServerKey(serverKeyID: string, signedServerKeyID: string, threshold: number): Promise<string> {
        const url = `${this.url}/shadow/${remove0x(serverKeyID)}/${remove0x(signedServerKeyID)}/${threshold}`;
        return removeEnclosingDQuotes(await this._send<string>('post', url));
    }

    /**
     * @description Retrieves the public portion of an already generated server key.
     *
     * Useable after a [successful server key generation session]{@link https://openethereum.github.io/wiki/Secret-Store.html#server-key-generation-session}
     * performed by the same user who generated the server key.
     *
     * @param {string} serverKeyID The ID of previously generated server key.
     * @param {string} signedServerKeyID The hex-encoded server key ID, signed by the same entity (author) that has signed the server key ID in server key generation session.
     * @returns {Promise<string>} The hex-encoded public portion of the server key.
     */
    async retrieveServerKeyPublic(serverKeyID: string, signedServerKeyID: string): Promise<string> {
        const url = `${this.url}/server/${remove0x(serverKeyID)}/${remove0x(signedServerKeyID)}`;
        return removeEnclosingDQuotes(await this._send<string>('get', url));
    }

    /**
     * @description Binds an externally-generated document key to a server key.
     *
     * Useable after a [server key generation session]{@link https://openethereum.github.io/wiki/Secret-Store#server-key-generation-session}.
     * More information can be found [here]{@link https://openethereum.github.io/wiki/Secret-Store#document-key-storing-session}.
     *
     * @param {string} serverKeyID The hex-encoded server key ID, the same that was used in the server key generation session.
     * @param {string} signedServerKeyID The hex-encoded server key ID, signed by the same entity (author) that has signed the server key id in the server key generation session.
     * @param {ExternallyEncryptedDocumentKey} localDocumentKey The externally encrypted document key object (with public server key, using special procedure) containinng
     * the common point and encrypted point.
     * @returns {Promise<string>} Empty string if everything was OK (status code 200).
     */
    async storeDocumentKey(
        serverKeyID: string,
        signedServerKeyID: string,
        localDocumentKey: ExternallyEncryptedDocumentKey
    ): Promise<string>;

    /**
     * @description Binds an externally-generated document key to a server key.
     *
     * Useable after a [server key generation session]{@link https://openethereum.github.io/wiki/Secret-Store#server-key-generation-session}.
     * More information can be found [here]{@link https://openethereum.github.io/wiki/Secret-Store#document-key-storing-session}.
     *
     * @param {string} serverKeyID The hex-encoded server key ID, the same that was used in the server key generation session.
     * @param {string} signedServerKeyID The hex-encoded server key ID, signed by the same entity (author) that has signed the server key id in the server key generation session.
     * @param {string} commonPoint The hex-encoded common point portion of the externally encrypted document key (with public server key, using special procedure).
     * @param {string} encryptedPoint The hex-encoded encrypted point portion of the externally encrypted document key (wtih public server key, using special procedure).
     * @returns {Promise<string>} Empty string if everything was OK (status code 200).
     */
    async storeDocumentKey(
        serverKeyID: string,
        signedServerKeyID: string,
        commonPoint: string,
        encryptedPoint: string
    ): Promise<string>;

    /**
     * @description Binds an externally-generated document key to a server key.
     *
     * Useable after a [server key generation session]{@link https://openethereum.github.io/wiki/Secret-Store#server-key-generation-session}.
     * More information can be found [here]{@link https://openethereum.github.io/wiki/Secret-Store#document-key-storing-session}.
     *
     * @param {string} serverKeyID The hex-encoded server key ID, the same that was used in the server key generation session.
     * @param {string} signedServerKeyID The hex-encoded server key ID, signed by the same entity (author) that has signed the server key id in the server key generation session.
     * @param {string | ExternallyEncryptedDocumentKey} commonPointOrKey The hex-encoded common point portion of the externally encrypted document key,
     * or the externally encrypted document key object (with public server key, using special procedure).
     * @param {string} [encryptedPoint] The hex-encoded encrypted point portion of the externally encrypted document key (wtih public server key, using special procedure).
     * @returns {Promise<string>} Empty string if everything was OK (status code 200).
     */
    async storeDocumentKey(
        serverKeyID: string,
        signedServerKeyID: string,
        commonPointOrKey: string | ExternallyEncryptedDocumentKey,
        encryptedPoint?: string
    ): Promise<string> {
        if (!commonPointOrKey) {
            throw new Error('No document key parameters were given');
        }
        let cp;
        let ep;
        if (typeof commonPointOrKey === 'string' || commonPointOrKey instanceof String) {
            if (!encryptedPoint) {
                throw new Error(`Common point was given but no encrypted point (${encryptedPoint})`);
            }
            cp = remove0x(commonPointOrKey as string);
            ep = remove0x(encryptedPoint);
        } else {
            cp = remove0x((commonPointOrKey as ExternallyEncryptedDocumentKey).common_point);
            ep = remove0x((commonPointOrKey as ExternallyEncryptedDocumentKey).encrypted_point);
        }

        const url = `${this.url}/shadow/${remove0x(serverKeyID)}/${remove0x(signedServerKeyID)}/${cp}/${ep}`;
        return this._send<string>('post', url);
    }

    /**
     * @description Generating server and document keys by one of the participating nodes with one call.
     *
     * You can generate both keys simultaneously, but if you’re not trusting the Secret Store nodes, it is advised
     * to run separate server key generation and document key storing sessions.
     * More information can be found [here]{@link https://openethereum.github.io/wiki/Secret-Store#server-and-document-key-generation-session}.
     *
     * @param {string} serverKeyID The server key ID of your choosing. It would be good to use document contents hash as this identifier.
     * Otherwise, it could be a random value. In both cases, please note that this value is unique and cannot be changed later.
     * @param {string} signedServerKeyID The server key ID, signed with author’s private key.
     * @param {number} threshold The key threshold value. Please consider the
     * [guidelines]{@link https://openethereum.github.io/wiki/Secret-Store.html#server-key-generation-session} when choosing this value.
     * @returns {Promise<string>} The hex-encoded document key, encrypted with requester’s public key (ECIES encryption is used).
     */
    async generateServerAndDocumentKey(
        serverKeyID: string,
        signedServerKeyID: string,
        threshold: number
    ): Promise<string> {
        const url = `${this.url}/${remove0x(serverKeyID)}/${remove0x(signedServerKeyID)}/${threshold}`;
        return removeEnclosingDQuotes(await this._send<string>('post', url));
    }

    /**
     * @description Fetches the document key from the secret store.
     *
     * This session is a preferable way of retrieving the previously generated document key. During document key shadow retrieval
     * session, document key is not reconstructed on any node, but it requires Secret Store client either to have access to Parity RPCs,
     * or to run some EC calculations to decrypt the document key.
     *
     * Please note that the requester must have permission to access this key. Permissions are often managed by a permissioning contract.
     *
     * More information can be found [here]{@link https://openethereum.github.io/wiki/Secret-Store#document-key-shadow-retrieval-session}.
     *
     * @param {string} serverKeyID The ID of previously generated server key, to which the document key has been bound.
     * @param {string} signedServerKeyID The server key ID, signed with the private key of requester, having access to the server key.
     * @returns {Promise<DocumentKeyPortions>} The object containing the hex-encoded decrypted_secret, common_point and decrypt_shadows fields.
     * To reconstruct the document key, Secret Store client must pass these values to a secretstore_shadowDecrypt RPC call.
     */
    async shadowRetrieveDocumentKey(serverKeyID: string, signedServerKeyID: string): Promise<DocumentKeyPortions> {
        const url = `${this.url}/shadow/${remove0x(serverKeyID)}/${remove0x(signedServerKeyID)}`;
        return this._send<DocumentKeyPortions>('get', url);
    }

    /**
     * @description Fetches the document key from the Secret Store.
     *
     * This is the lighter version of the [document key shadow retrieval session]{@link https://openethereum.github.io/wiki/Secret-Store#document-key-shadow-retrieval-session},
     * which returns the final document key (encrypted with the requester's public key).
     * You must have enough trust in the Secret Store nodes for this. During document key shadow retrieval
     * session, document key is not reconstructed on any node, but it requires the Secret Store client
     * either to have access to Parity RPCs, or to run some EC calculations to decrypt the document key.
     *
     * Please note that the requester must have permission to access this key. Permissions are often managed by a permissioning contract.
     *
     * More information can be found [here]{@link https://openethereum.github.io/wiki/Secret-Store#document-key-retrieval-session}.
     *
     * @param {string} serverKeyID The ID of previously generated server key, to which document key has been bound.
     * @param {string} signedServerKeyID The server key ID, signed with the private key of requester, having access to the server key.
     * @returns {Promise<string>} The hex-encoded document key, encrypted with requester's public key (ECIES encryption is used).
     */
    async retrieveDocumentKey(serverKeyID: string, signedServerKeyID: string): Promise<string> {
        const url = `${this.url}/${remove0x(serverKeyID)}/${remove0x(signedServerKeyID)}`;
        return removeEnclosingDQuotes(await this._send<string>('get', url));
    }

    /**
     * @description Schnorr signing session, for computing Schnorr signature of a given 256-bit message hash.
     *
     * More information can be found [here]{@link https://openethereum.github.io/wiki/Secret-Store#schnorr-signing-session}.
     *
     * @param {string} serverKeyID The previously generated hex-encoded server key ID.
     * @param {string} signedServerKeyID The hex-encoded, previously generated server key ID, signed with the private key of requester, having access to the server key.
     * @param {string} messageHash The 256-bit hash of the message that needs to be signed.
     * @returns {Promise<string>} The hex-encoded Schnorr signature (serialized as c || s),
     * encrypted with requester's public key (ECIES encryption is used).
     */
    async signSchnorr(serverKeyID: string, signedServerKeyID: string, messageHash: string): Promise<string> {
        const url = `${this.url}/schnorr/${remove0x(serverKeyID)}/${remove0x(signedServerKeyID)}/${messageHash}`;
        return removeEnclosingDQuotes(await this._send<string>('get', url));
    }

    /**
     * @description ECDSA signing session, for computing ECDSA signature of a given 256-bit message hash.
     *
     * More information can be found [here]{@link https://openethereum.github.io/wiki/Secret-Store#ecdsa-signing-session}.
     *
     * @param {string} serverKeyID The previously generated hex-encoded server key ID.
     * @param {string} signedServerKeyID The hex-encoded, previously generated server key ID signed with the private key of requester, having access to the server key.
     * @param {string} messageHash The 256-bit hash of the message that needs to be signed.
     * @returns {Promise<string>} The hex-encoded ECDSA signature (serialized as r || s || v ), encrypted with requester public key (ECIES encryption is used).
     */
    async signEcdsa(serverKeyID: string, signedServerKeyID: string, messageHash: string): Promise<string> {
        const url = `${this.url}/ecdsa/${remove0x(serverKeyID)}/${remove0x(signedServerKeyID)}/${messageHash}`;
        return removeEnclosingDQuotes(await this._send<string>('get', url));
    }

    /**
     *
     * @description Node set change session.
     *
     * Please follow [the description]{@link https://openethereum.github.io/wiki/Secret-Store-Configuration.html#changing-the-configuration-of-a-set-of-servers}
     * on how to perform this session.
     *
     * Requires all added, removed and stable nodes to be online for the duration
     * of the session. Before starting the session, you’ll need to generate two administrator’s
     * signatures: old set signature and new set signature. To generate these signatures,
     * the Secret Store RPC methods should be used: serversSetHash and signRawHash.
     *
     * @param {string[]} nodeIDsNewSet Node IDs of the *new set*.
     * @param {string} signatureOldSet ECDSA signature of all online node IDs *keccak(ordered_list(staying + added + removing))*.
     * @param {string} signatureNewSet ECDSA signature of node IDs that should stay in the Secret Store cluster after the session ends *keccak(ordered_list(staying + added))*.
     * @returns {Promise<string>} Empty string if everything was OK (status code 200).
     */
    async nodesSetChange(nodeIDsNewSet: string[], signatureOldSet: string, signatureNewSet: string): Promise<string> {
        const url = `${this.url}/admin/servers_set_change/${remove0x(signatureOldSet)}/${remove0x(signatureNewSet)}`;
        const body = JSON.stringify(nodeIDsNewSet);
        return removeEnclosingDQuotes(await this._send<string>('post', url, body));
    }
}

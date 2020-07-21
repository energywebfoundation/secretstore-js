/** @module client/local */

import * as ethers from 'ethers';
import * as utils from '../utils';
import { DocumentKeyShadows } from './session';

export interface LocalDocumentKey {
    common_point: string;
    encrypted_key: string;
    encrypted_point: string;
}

/**
 * @memberof module:client/local
 * @class
 */
export class SecretStoreLocalAPIClient {
    provider: ethers.providers.JsonRpcProvider;

    /**
     * The class holding together the OpenEthereum secretstore module RPC API. Should be use for local operations.
     *
     * @param {String | ethers.providers.JsonRpcProvider} ssLocalAPIEndpoint The RPC endpoint of an OpenEthereum client.
     * This should be a local node for trust reasons.
     */
    constructor(ssLocalAPIEndpoint: string | ethers.providers.JsonRpcProvider) {
        if (!ssLocalAPIEndpoint) {
            throw new Error(`Secret Store RPC module endpoint URL was not given`);
        }
        if (typeof ssLocalAPIEndpoint === 'string' || ssLocalAPIEndpoint instanceof String) {
            this.provider = new ethers.providers.JsonRpcProvider(ssLocalAPIEndpoint as string);
            return;
        }
        this.provider = ssLocalAPIEndpoint as ethers.providers.JsonRpcProvider;
    }

    private async _send<T>(method: string, ...params: any[]): Promise<T> {
        const res = await this.provider.send(method, params);
        if (res.error) {
            throw new Error(res.error);
        }
        return res as T;
    }

    /**
     *
     * Computes recoverable ECDSA signatures.
     *
     * Typically used for signatures of server key ID and signatures of nodes-set hash in the Secret Store.
     *
     * @param {string} account The address of a SecretStore user.
     * @param {string} pwd The password of the SecretStore user for the account given.
     * @param {string} rawhash A 256-bit hash to be signed as a hex string (with or without 0x prefix), e.g.: server key id or nodes-set hash.
     * @returns {Promise<string>} The signed hash.
     */
    async signRawHash(account: string, pwd: string, rawhash: string): Promise<string> {
        return this._send<string>('secretstore_signRawHash', account, pwd, utils.ensure0x(rawhash));
    }

    /**
     * Securely generates a document key locally in a way that it remains unknown to all key servers.
     *
     * @param {string} account The address of a SecretStore user.
     * @param {string} pwd The password of the SecretStore user for the account given.
     * @param {string} serverKey The server key, returned by a [server key generating session]{@link https://openethereum.github.io/wiki/Secret-Store#server-key-generation-session}.
     * @return {Promise<LocalDocumentKey>} The generated document key.
     */
    async generateDocumentKey(account: string, pwd: string, serverKey: string): Promise<LocalDocumentKey> {
        return this._send<any>('secretstore_generateDocumentKey', account, pwd, utils.ensure0x(serverKey));
    }

    /**
     * You can use it to encrypt a small document.
     *
     * An encryption key is needed, typically obtained from the store by running
     * a [document key retrieval session]{@link https://openethereum.github.io/wiki/Secret-Store#document-key-retrieval-session} or
     * a [server- and document key generation session]{@link https://openethereum.github.io/wiki/Secret-Store#server-and-document-key-generation-session}.
     *
     * @param {string} account The address of a SecretStore user.
     * @param {string} pwd The password of the SecretStore user for the account given.
     * @param {string} hexDocument Hex encoded document data.
     * @param {string} encryptedDocumentKey Document key encrypted with requester's public key, as a hex string.
     * @return {Promise<string>} The encrypted secret document as a hex encoded string.
     */
    async encrypt(account: string, pwd: string, hexDocument: string, encryptedDocumentKey: string): Promise<string> {
        return this._send<string>(
            'secretstore_encrypt',
            account,
            pwd,
            utils.ensure0x(encryptedDocumentKey),
            utils.ensure0x(hexDocument)
        );
    }

    /**
     * This method can be used to decrypt a document, encrypted by
     * the [encrypt()]{@link SecretStoreLocalAPIClient#encrypt} method before.
     *
     * @param {string} account The address of a SecretStore user.
     * @param {string} pwd The password of the SecretStore user for the account given.
     * @param {string} encryptedDocument The encrypted document data, returned by "encrypt" as hex string.
     * @param {string} encryptedDocumentKey The document key encrypted with requester’s public key, as hex string.
     * @return {Promise<string>} The decrypted secret document.
     */
    async decrypt(
        account: string,
        pwd: string,
        encryptedDocument: string,
        encryptedDocumentKey: string
    ): Promise<string> {
        return this._send<string>(
            'secretstore_decrypt',
            account,
            pwd,
            utils.ensure0x(encryptedDocumentKey),
            utils.ensure0x(encryptedDocument)
        );
    }

    /**
     * This method can be used to decrypt a document, encrypted by
     * the [encrypt()]{@link SecretStoreLocalAPIClient#encrypt} method before.
     *
     * Document key can be obtained by
     * a [document key shadow retrieval session]{@link https://openethereum.github.io/wiki/Secret-Store#document-key-shadow-retrieval-session}.
     *
     * @param {string} account The address of a SecretStore user.
     * @param {string} pwd The password of the SecretStore user for the account given.
     * @param {string} encryptedDocument Encrypted document data, returned by [encrypt()]{@link SecretStoreLocalAPIClient#encrypt}, as hex string.
     * @param {DocumentKeyShadows} documentKeyShadows The document shadows object, containing the portions of an encrypted document key:
     * decrypted secret, common point and decrypt shadows.
     * @return {Promise<string>} The decrypted secret document.
     */
    async shadowDecrypt(
        account: string,
        pwd: string,
        encryptedDocument: string,
        documentKeyShadows: DocumentKeyShadows
    ): Promise<string>;

    /**
     * This method can be used to decrypt a document, encrypted by
     * the [encrypt()]{@link SecretStoreLocalAPIClient#encrypt} method before.
     *
     * Document key can be obtained by
     * a [document key shadow retrieval session]{@link https://openethereum.github.io/wiki/Secret-Store#document-key-shadow-retrieval-session}.
     *
     * @param {string} account The address of a SecretStore user.
     * @param {string} pwd The password of the SecretStore user for the account given.
     * @param {string} encryptedDocument Encrypted document data, hex encoded, returned by [encrypt()]{@link SecretStoreLocalAPIClient#encrypt}.
     * @param {string} decryptedSecret The hex-encoded decrypted secret portion of an encrypted document key.
     * @param {string} commonPoint The hex-encoded common point portion of an encrypted document key.
     * @param {string[]} decryptShadows The hex-encoded encrypted point portions of an encrypted document key.
     * @return {Promise<string>} The decrypted secret document.
     */
    async shadowDecrypt(
        account: string,
        pwd: string,
        encryptedDocument: string,
        decryptedSecret: string,
        commonPoint: string,
        decryptShadows: string[]
    ): Promise<string>;

    /**
     * This method can be used to decrypt a document, encrypted by
     * the [encrypt()]{@link SecretStoreLocalAPIClient#encrypt} method before.
     *
     * Document key can be obtained by
     * a [document key shadow retrieval session]{@link https://openethereum.github.io/wiki/Secret-Store#document-key-shadow-retrieval-session}.
     *
     * @param {string} account The address of a SecretStore user.
     * @param {string} pwd The password of the SecretStore user for the account given.
     * @param {string} encryptedDocument Encrypted document data, hex encoded, returned by [encrypt()]{@link SecretStoreLocalAPIClient#encrypt}.
     * @param {string} decryptedSecretOrDocumentKeyShadows The hex-encoded decrypted secret portion or document shadows object of an encrypted document key.
     * @param {string} commonPoint The hex-encoded common point portion of an encrypted document key.
     * @param {string[]} decryptShadows The hex-encoded encrypted point portions of an encrypted document key.
     * @return {Promise<string>} The decrypted secret document.
     */
    async shadowDecrypt(
        account: string,
        pwd: string,
        encryptedDocument: string,
        decryptedSecretOrDocumentKeyShadows: string | DocumentKeyShadows,
        commonPoint?: string,
        decryptShadows?: string[]
    ): Promise<string> {
        if (!decryptedSecretOrDocumentKeyShadows) {
            throw new Error('Document key portions were not supplied');
        }
        if (
            typeof decryptedSecretOrDocumentKeyShadows === 'string' ||
            decryptedSecretOrDocumentKeyShadows instanceof String
        ) {
            if (!commonPoint || !decryptShadows || decryptShadows.length === 0) {
                throw new Error(
                    `Not enough document key portions were supplied (${decryptedSecretOrDocumentKeyShadows},${commonPoint},${decryptShadows})`
                );
            }
            return this._send<string>(
                'secretstore_shadowDecrypt',
                account,
                pwd,
                utils.ensure0x(decryptedSecretOrDocumentKeyShadows as string),
                utils.ensure0x(commonPoint),
                decryptShadows,
                utils.ensure0x(encryptedDocument)
            );
        }
        return this._send<string>(
            'secretstore_shadowDecrypt',
            account,
            pwd,
            utils.ensure0x((decryptedSecretOrDocumentKeyShadows as DocumentKeyShadows).decrypted_secret),
            utils.ensure0x((decryptedSecretOrDocumentKeyShadows as DocumentKeyShadows).common_point),
            (decryptedSecretOrDocumentKeyShadows as DocumentKeyShadows).decrypt_shadows,
            utils.ensure0x(encryptedDocument)
        );
    }

    /**
     *
     * Computes the hash of node ids, required to compute a node-set signature for manual
     * [nodes set change session]{@link https://openethereum.github.io/wiki/Secret-Store-Configuration#changing-the-configuration-of-a-set-of-servers}.
     *
     * @param {string[]} nodeIDs List of hex-encoded node ID’s (public keys, enode addresses).
     * @returns {Promise<string>} The hash as a hex string.
     */
    async serversSetHash(nodeIDs: string[]): Promise<string> {
        return this._send<string>('secretstore_serversSetHash', nodeIDs);
    }
}

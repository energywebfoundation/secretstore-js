/** @module secretstore */

"use strict";

const utils = require("../utils.js");
const session = require("./session");

/**
 * @memberof module:secretstore
 * @class
 */
class SecretStore {

    /**
     * The class holding together the secretstore module API- and session calls.
     * 
     * @param {Object} web3 The web3 object.
     * @param {String} ss_enpoint_uri The endpoint of the Secret Store node that is listening for session requests. Defaults to null, so can be omitted if you do not want to use SS sessions.
     */
    constructor(web3, ss_enpoint_uri = null) {
        this.web3 = web3;
        if (!ss_enpoint_uri) {
            console.warn("SS enpoint URI was not given. Did you accidentally forget?");
        } else {
            this.session = new session.Session(ss_enpoint_uri);
        }
    }

    /**
     * 
     * Computes recoverable ECDSA signatures.
     * 
     * Typically used for signatures of server key id and signatures of nodes-set hash in the Secret Store.
     * 
     * @param {String} account The account of SS user.
     * @param {String} pwd The password of SS user.
     * @param {String} rawhash A 256-bit hash to be signed, e.g.: server key id or nodes-set hash.
     * @param {Boolean} verbose Whether to console log errors.
     * @returns {Promise<String>} The signed hash.
     */
    signRawHash(account, pwd, rawhash, verbose = true) {
        return new Promise((resolve, reject) => {
            this.web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'secretstore_signRawHash',
                params: [account, pwd, utils.add0x(rawhash)],
                id: 1
            }, (e, r) => {
                if (e) {
                    if (verbose) utils.logError(e);
                    reject(e);
                }
                else if (r.error !== undefined) {
                    if (verbose) utils.logError(r.error);
                    reject(r.error);
                }
                else {
                    resolve(r.result);
                }
            });
        });
    }

    /**
     * Securely generates document key, so that it remains unknown to all key servers.
     * 
     * @param {String} account The account of SS user.
     * @param {String} pwd The password of SS user.
     * @param {String} serverKey The server key, returned by a [server key generating session]{@link https://wiki.parity.io/Secret-Store#server-key-generation-session}.
     * @param {Boolean} verbose Whether to console log errors.
     * @return {Promise<String>} The document key.
     */
    generateDocumentKey(account, pwd, serverKey, verbose = true) {
        return new Promise((resolve, reject) => {
            this.web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'secretstore_generateDocumentKey',
                params: [account, pwd, serverKey],
                id: 1
            }, (e, r) => {
                if (e) {
                    if (verbose) utils.logError(e);
                    reject(e);
                }
                else if (r.error !== undefined) {
                    if (verbose) utils.logError(r.error);
                    reject(r.error);
                }
                else {
                    resolve(r.result);
                }
            });
        });
    }

    /**
     * You can use it to encrypt a small document.
     * 
     * An encryption key is needed, typically obtained from the store by running 
     * a [document key retrieval session]{@link https://wiki.parity.io/Secret-Store#document-key-retrieval-session} or 
     * a [server- and document key generation session]{@link https://wiki.parity.io/Secret-Store#server-and-document-key-generation-session}.
     * 
     * @param {String} account The account of SS user.
     * @param {String} pwd The password of SS user.
     * @param {String} encryptedKey Document key encrypted with requester's public key.
     * @param {String} hexDocument Hex encoded document data.
     * @param {Boolean} verbose Whether to console log errors.
     * @return {Promise<String>} The encrypted secret document.
     */
    encrypt(account, pwd, encryptedKey, hexDocument, verbose = true) {
        return new Promise((resolve, reject) => {
            this.web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'secretstore_encrypt',
                params: [account, pwd, encryptedKey, hexDocument],
                id: 1
            }, (e, r) => {
                if (e) {
                    if (verbose) utils.logError(e);
                    reject(e);
                }
                else if (r.error !== undefined) {
                    if (verbose) utils.logError(r.error);
                    reject(r.error);
                }
                else {
                    resolve(r.result);
                }
            });
        });
    }

    /**
     * This method can be used to decrypt document, encrypted by 
     * the [encrypt()]{@link SecretStore#encrypt} method before.
     * 
     * @param {String} account The account of SS user.
     * @param {String} pwd The password of SS user.
     * @param {String} encryptedKey The document key encrypted with requester’s public key.
     * @param {String} encryptedDocument The encrypted document data, returned by "encrypt".
     * @param {Boolean} verbose Whether to console log errors.
     * @return {Promise<String>} The decrypted secret document.
     */
    decrypt(account, pwd, encryptedKey, encryptedDocument, verbose = true) {
        return new Promise((resolve, reject) => {
            this.web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'secretstore_decrypt',
                params: [account, pwd, encryptedKey, encryptedDocument],
                id: 1
            }, (e, r) => {
                if (e) {
                    if (verbose) utils.logError(e);
                    reject(e);
                }
                else if (r.error !== undefined) {
                    if (verbose) utils.logError(r.error);
                    reject(r.error);
                }
                else {
                    resolve(r.result);
                }
            });
        });
    }

    /**
     * This method can be used to decrypt document, encrypted by 
     * the [encrypt()]{@link SecretStore#encrypt} method before.
     * 
     * Document key can be obtained by 
     * a [document key shadow retrieval session]{@link https://wiki.parity.io/Secret-Store#document-key-shadow-retrieval-session}.
     * 
     * @param {String} account The account of SS user.
     * @param {String} pwd The password of SS user.
     * @param {String} decryptedSecret The hex-encoded decrypted secret portion of an encrypted document key.
     * @param {String} commonPoint The hex-encoded common point portion of an encrypted document key.
     * @param {String} decryptShadows The hex-encoded encrypted point portion of an encrypted document key.
     * @param {String} encryptedDocument Encrypted document data, returned by [encrypt()]{@link SecretStore#encrypt}.
     * @param {Boolean} verbose Whether to console log errors.
     * @return {Promise<String>} The decrypted secret document.
     */
    shadowDecrypt(account, pwd, decryptedSecret, commonPoint, decryptShadows, encryptedDocument, verbose = true) {
        return new Promise((resolve, reject) => {
            this.web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'secretstore_shadowDecrypt',
                params: [account, pwd, decryptedSecret, commonPoint, decryptShadows, encryptedDocument],
                id: 1
            }, (e, r) => {
                if (e) {
                    if (verbose) utils.logError(e);
                    reject(e);
                }
                else if (r.error !== undefined) {
                    if (verbose) utils.logError(r.error);
                    reject(r.error);
                }
                else {
                    resolve(r.result);
                }
            });
        });
    }

    /**
     * 
     * Computes the hash of nodes ids, required to compute a node-set signature manual 
     * [nodes set change session]{@link https://wiki.parity.io/Secret-Store-Configuration#changing-the-configuration-of-a-set-of-servers}.
     * 
     * @param {Array<String>} nodeIDs List of node ID’s (public keys).
     * @param {Boolean} verbose Whether to console log errors.
     * @returns {Promise<String>} The hash.
     */
    serversSetHash(nodeIDs, verbose = true) {
        return new Promise((resolve, reject) => {
            this.web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'secretstore_serversSetHash',
                params: [nodeIDs],
                id: 1
            }, (e, r) => {
                if (e) {
                    if (verbose) utils.logError(e);
                    reject(e);
                }
                else if (r.error !== undefined) {
                    if (verbose) utils.logError(r.error);
                    reject(r.error);
                }
                else {
                    resolve(r.result);
                }
            });
        });
    }

};

module.exports = SecretStore;

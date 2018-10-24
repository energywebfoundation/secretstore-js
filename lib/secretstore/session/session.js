/** @module secretstore/session */
"use strict";

const utils = require("../../utils.js");

/**
 * Thrown when an error has occured during the Secret Store session.
 * 
 * @memberof module:secretstore/session
 * @class
 */
class SecretStoreSessionError extends Error {
    /**
     * @constructor
     * @param {String} message The error message.
     * @param {Object} response The response object.
     */
    constructor(message, response) {
        super(message);
        this.response = response;
        this.name = "SecretStoreSessionError";
    }
};

/**
 * The class holding together the secretstore session calls.
 * 
 * @memberof module:secretstore/session
 * @class
 */
class Session {

    /**
     * 
     * @param {String} ss_endpoint_uri The endpoint URI where the Secret Store node is listening for incoming session requests.
     */
    constructor(ss_endpoint_uri) {
        if (!ss_endpoint_uri) {
            throw new Error("Secret Store enpoint URI was not given, or invalid: " + ss_endpoint_uri);
        }
        if (ss_endpoint_uri.endsWith("/")) {
            this.uri = ss_endpoint_uri.slice(0, -1);
        } else {
            this.uri = ss_endpoint_uri;
        }
    }

    /**
     * Generates server keys.
     * 
     * @param {String} serverKeyID The server key ID.
     * @param {String} signedServerKeyID The server key ID signed by the SS user.
     * @param {Number} threshold The key threshold value. Please consider the 
     * [guidelines]{@link {https://wiki.parity.io/Secret-Store.html#server-key-generation-session} when choosing this value.
     * @param {Boolean} verbose Whether to console log errors.
     * @returns {Promise<String>} The hex-encoded public portion of the server key.
     */
    generateServerKey(serverKeyID, signedServerKeyID, threshold, verbose = true) {

        return new Promise((resolve, reject) => {
            const request = require('request');

            var options = {
                url: this.uri + "/shadow/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID) + "/" + threshold,
                method: 'POST'
            };

            request(options, (error, response, body) => {
                if (error) {
                    if (verbose) utils.logError(e);
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    if (verbose) utils.logFailedResponse(response, body, options);
                    var sserror = new SecretStoreSessionError("Request failed.", response);
                    reject(sserror);
                }
                else {
                    resolve(utils.removeEnclosingDQuotes(body));
                }
            });
        });
    }

    /**
     * 
     * Generating document key by one of the participating nodes.
     * 
     * While it is possible (and more secure, if you’re not trusting the Secret Store nodes) 
     * to run separate server key generation and document key storing sessions, 
     * you can generate both keys simultaneously.
     * 
     * @param {String} serverKeyID The server key ID.
     * @param {String} signedServerKeyID The server key ID signed by the SS user.
     * @param {Number} threshold The key threshold value. Please consider the 
     * [guidelines]{@link {https://wiki.parity.io/Secret-Store.html#server-key-generation-session} when choosing this value.
     * @param {Boolean} verbose Whether to console log errors.
     * @returns {Promise<String>} The hex-encoded document key, encrypted with requester’s public key (ECIES encryption is used) .
     */
    generateServerAndDocumentKey(serverKeyID, signedServerKeyID, threshold, verbose = true) {

        return new Promise((resolve, reject) => {
            const request = require('request');

            var options = {
                url: this.uri + "/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID) + "/" + threshold,
                method: 'POST'
            };

            request(options, (error, response, body) => {
                if (error) {
                    if (verbose) utils.logError(e);
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    if (verbose) utils.logFailedResponse(response, body, options);
                    var sserror = new SecretStoreSessionError("Request failed.", response);
                    reject(sserror);
                }
                else {
                    resolve(utils.removeEnclosingDQuotes(body));
                }
            });
        });
    }

    /**
     * Fetches the document key from the secret store.
     * 
     * This session is a preferable way of retrieving the previously generated document key.
     * 
     * @param {String} serverKeyID The server key ID.
     * @param {String} signedServerKeyID The server key ID signed by the SS user.
     * @param {Boolean} verbose Whether to console log errors.
     * @returns {Promise<Object>} The hex-encoded decrypted_secret, common_point and decrypt_shadows fields.
     */
    shadowRetrieveDocumentKey(serverKeyID, signedServerKeyID, verbose = true) {
        return new Promise((resolve, reject) => {
            const request = require('request');

            var options = {
                url: this.uri + "/shadow/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID),
                method: 'GET'
            };

            request(options, (error, response, body) => {
                if (error) {
                    if (verbose) utils.logError(e);
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    if (verbose) utils.logFailedResponse(response, body, options);
                    var sserror = new SecretStoreSessionError("Request failed.", response);
                    reject(sserror);
                }
                else {
                    resolve(JSON.parse(body));
                }
            });
        });
    }

    /**
     * 
     * Fetches the document key from the secret store.
     * 
     * This is the lighter version of the document key shadow retrieval session, 
     * which returns final document key (though, encrypted with requester public key) 
     * if you have enough trust in the Secret Store nodes. During document key shadow retrieval 
     * session, document key is not reconstructed on any node, but it requires Secret Store client 
     * either to have an access to Parity RPCs, or to run some EC calculations to decrypt the document key.
     * 
     * @param {String} serverKeyID The server key ID.
     * @param {String} signedServerKeyID The server key ID signed by the SS user.
     * @param {Boolean} verbose Whether to console log errors.
     * @returns {Promise<String>} The hex-encoded document key, encrypted with requester's public key (ECIES encryption is used).
     */
    retrieveDocumentKey(serverKeyID, signedServerKeyID, verbose = true) {
        return new Promise((resolve, reject) => {
            const request = require('request');

            var options = {
                url: this.uri + "/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID),
                method: 'GET'
            };

            request(options, (error, response, body) => {
                if (error) {
                    if (verbose) utils.logError(e);
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    if (verbose) utils.logFailedResponse(response, body, options);
                    var sserror = new SecretStoreSessionError("Request failed.", response);
                    reject(sserror);
                }
                else {
                    resolve(utils.removeEnclosingDQuotes(body));
                }
            });
        });
    }

    /**
     * Schnorr signing session, for computing Schnorr signature of a given message hash.
     * 
     * @param {String} serverKeyID The server key ID.
     * @param {String} signedServerKeyID The server key ID signed by the SS user.
     * @param {String} messageHash The 256-bit hash of the message that needs to be signed.
     * @param {Boolean} verbose Whether to console log errors.
     * @returns {Promise<String>} The hex-encoded Schnorr signature (serialized as c || s), 
     * encrypted with requester's public key (ECIES encryption is used).
     */
    signSchnorr(serverKeyID, signedServerKeyID, messageHash, verbose = true) {
        return new Promise((resolve, reject) => {
            const request = require('request');

            var options = {
                url: this.uri + "/schnorr/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID) + "/" + messageHash,
                method: 'GET'
            };

            request(options, (error, response, body) => {
                if (error) {
                    if (verbose) utils.logError(e);
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    if (verbose) utils.logFailedResponse(response, body, options);
                    var sserror = new SecretStoreSessionError("Request failed.", response);
                    reject(sserror);
                }
                else {
                    resolve(utils.removeEnclosingDQuotes(body));
                }
            });
        });
    }

    /**
     * ECDSA signing session, for computing ECDSA signature of a given message hash.
     * 
     * @param {String} serverKeyID The server key ID.
     * @param {String} signedServerKeyID The server key ID signed by the SS user.
     * @param {String} messageHash The 256-bit hash of the message that needs to be signed.
     * @param {Boolean} verbose Whether to console log errors.
     * @return {Promise<String>} The hex-encoded ECDSA signature (serialized as r || s || v ), encrypted with requester public key (ECIES encryption is used).
     */
    signEcdsa(serverKeyID, signedServerKeyID, messageHash, verbose = true) {
        return new Promise((resolve, reject) => {
            const request = require('request');

            var options = {
                url: this.uri + "/ecdsa/" + utils.remove0x(serverKeyID) + "/" + utils.remove0x(signedServerKeyID) + "/" + messageHash,
                method: 'GET'
            };

            request(options, (error, response, body) => {
                if (error) {
                    if (verbose) utils.logError(e);
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    if (verbose) utils.logFailedResponse(response, body, options);
                    var sserror = new SecretStoreSessionError("Request failed.", response);
                    reject(sserror);
                }
                else {
                    resolve(utils.removeEnclosingDQuotes(body));
                }
            });
        });
    }


    /**
     * Binds an externally-generated document key to a server key.
     * 
     * Useable after a [server key generation session]{@link https://wiki.parity.io/Secret-Store#server-key-generation-session}.
     * 
     * @param {String} serverKeyID The server key ID.
     * @param {String} signedServerKeyID The server key ID signed by the SS user.
     * @param {String} commonPoint The hex-encoded common point portion of encrypted document key.
     * @param {String} encryptedPoint The hex-encoded encrypted point portion of encrypted document key.
     * @param {Boolean} verbose Whether to console log errors.
     * @returns {Promise<String>} Empty string if everything was OK (status code 200).
     */
    storeDocumentKey(serverKeyID, signedServerKeyID, commonPoint, encryptedPoint, verbose = true) {
        return new Promise((resolve, reject) => {
            const request = require('request');

            var options = {
                url: this.uri + "/shadow/" + utils.remove0x(serverKeyID)
                    + "/" + utils.remove0x(signedServerKeyID)
                    + "/" + utils.remove0x(commonPoint)
                    + "/" + utils.remove0x(encryptedPoint),
                method: 'POST'
            };

            request(options, (error, response, body) => {
                if (error) {
                    if (verbose) utils.logError(e);
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    if (verbose) utils.logFailedResponse(response, body, options);
                    var sserror = new SecretStoreSessionError("Request failed.", response);
                    reject(sserror);
                }
                else {
                    resolve(body);
                }
            });
        });
    }


    /**
     * 
     * Node set change session.
     * 
     * Requires all added, removed and stable nodes to be online for the duration 
     * of the session. Before starting the session, you’ll need to generate two administrator’s 
     * signatures: old set signature and new set signature. To generate these signatures, 
     * the Secret Store RPC methods should be used: serversSetHash and signRawHash.
     * 
     * @param {String} nodeIDsNewSet Node IDs of the *new set*.
     * @param {String} signatureOldSet ECDSA signature of all online nodes IDs *keccak(ordered_list(staying + added + removing))*.
     * @param {String} signatureNewSet ECDSA signature of nodes IDs, that should stay in the Secret Store after the session ends *keccak(ordered_list(staying + added))*.
     * @param {Boolean} verbose Whether to console log errors.
     * @returns {Promise<Object>} Empty string if everything was OK (status code 200).
     */
    nodesSetChange(nodeIDsNewSet, signatureOldSet, signatureNewSet, verbose = true) {
        return new Promise((resolve, reject) => {
            const request = require('request');

            /*
            let x = '["' + nodeIDsNewSet[0] + '"';
            for(var i = 1; i < nodeIDsNewSet.length; i++) {
                x += ',"' + nodeIDsNewSet[i] + '"';
            }
            x += ']';
            */
            var options = {
                url: this.uri + "/admin/servers_set_change"
                    + "/" + utils.remove0x(signatureOldSet)
                    + "/" + utils.remove0x(signatureNewSet),
                method: 'POST',
                body: JSON.stringify(nodeIDsNewSet)
                //body: x
            };

            request(options, (error, response, body) => {
                if (error) {
                    if (verbose) utils.logError(e);
                    reject(error);
                }
                else if (response.statusCode != 200) {
                    if (verbose) utils.logFailedResponse(response, body, options);
                    var sserror = new SecretStoreSessionError("Request failed.", response);
                    reject(sserror);
                }
                else {
                    resolve(utils.removeEnclosingDQuotes(body));
                }
            });
        });
    }
};

module.exports = {
    Session,
    SecretStoreSessionError
}
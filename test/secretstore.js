"use strict";

const path = require('path');

const assert = require('chai').assert;
const sha256 = require('crypto-js/sha256');

const assets = require("./assets.js");
const { alice, bob, charlie, admin } = assets.accounts;
const { alicepwd, bobpwd, charliepwd, adminpwd } = assets.passwords;
const { httpRpcAlice, httpRpcBob, httpRpcCharlie } = assets.httpRpc;
const { httpSSAlice, httpSSBob, httpSSCharlie } = assets.httpSS;
const { node1, node2, node3 } = assets.nodes;

const { SecretStore, Session, SecretStoreSessionError } = require(path.join(__dirname, '../lib/secretstore'));
const web3 = new (require('web3'))(httpRpcAlice);

const ss = new SecretStore(web3, httpSSAlice);

describe('Secret store correct inputs test', async () => {
    let doc;
    let hexDoc;
    let encryptedDoc;
    let docID;
    let signedDocID;
    let skey;
    let dkey;
    let retrievedKey;
    let shadowRetrievedKey;

    it('should sign raw hash', async () => {
        console.log(alice, alicepwd);
        docID = sha256("lololol").toString();
        signedDocID = await ss.signRawHash(alice, alicepwd, docID);
        assert.exists(signedDocID);
        assert.isNotEmpty(signedDocID);
    });

    it('should generate server key', async () => {
        docID = sha256(Math.random().toString()).toString();
        signedDocID = await ss.signRawHash(alice, alicepwd, docID);
        skey = await ss.session.generateServerKey(docID, signedDocID, 1);
        assert.exists(skey);
        assert.isNotEmpty(skey);
    });

    it('should retrieve generated server key public portion', async () => {
        docID = sha256(Math.random().toString()).toString();
        signedDocID = await ss.signRawHash(alice, alicepwd, docID);
        skey = await ss.session.generateServerKey(docID, signedDocID, 1);
        assert.exists(skey);
        assert.isNotEmpty(skey);
        let skey2 = await ss.session.retrieveServerKeyPublic(docID, signedDocID);
        assert.exists(skey2);
        assert.isNotEmpty(skey2);
        assert.equal(skey, skey2);
    });

    it('should generate document key', async () => {
        dkey = await ss.generateDocumentKey(alice, alicepwd, skey);
        assert.exists(dkey);
        assert.isNotEmpty(dkey);
    });

    it('should store the document key', async () => {
        var res = await ss.session.storeDocumentKey(docID, signedDocID, dkey.common_point, dkey.encrypted_point);
        assert.exists(res);
    });

    it('should generate server and document key', async () => {
        docID = sha256(Math.random().toString()).toString();
        signedDocID = await ss.signRawHash(alice, alicepwd, docID);
        dkey = await ss.session.generateServerAndDocumentKey(docID, signedDocID, 1);
        assert.exists(dkey);
        assert.isNotEmpty(dkey);
    });

    it('should shadow retrieve document key', async () => {
        shadowRetrievedKey = await ss.session.shadowRetrieveDocumentKey(docID, signedDocID);
        assert.exists(shadowRetrievedKey);
        assert.isNotEmpty(shadowRetrievedKey);
    });

    it('should retrieve document key', async () => {
        retrievedKey = await ss.session.retrieveDocumentKey(docID, signedDocID);
        assert.exists(retrievedKey);
        assert.isNotEmpty(retrievedKey);
    });

    it('should encrypt a document', async () => {
        hexDoc = web3.utils.toHex("lololololol");
        encryptedDoc = await ss.encrypt(alice, alicepwd, retrievedKey, hexDoc);
        assert.exists(encryptedDoc);
        assert.isNotEmpty(encryptedDoc);
    });

    it('should decrypt a document', async () => {
        let decryptedDoc = await ss.decrypt(alice, alicepwd, retrievedKey, encryptedDoc);
        assert.exists(decryptedDoc);
        assert.isNotEmpty(decryptedDoc);
        assert.equal(decryptedDoc, hexDoc);
    });

    it('should shadow decrypt a document', async () => {
        let decryptedDoc = await ss.shadowDecrypt(
            alice,
            alicepwd,
            shadowRetrievedKey.decrypted_secret,
            shadowRetrievedKey.common_point,
            shadowRetrievedKey.decrypt_shadows,
            encryptedDoc
        );
        assert.exists(decryptedDoc);
        assert.isNotEmpty(decryptedDoc);
        assert.equal(decryptedDoc, hexDoc);
    });

    it('should schnorr sign a message', async () => {
        let message = sha256("bongocat").toString();
        let signedMessage = await ss.session.signSchnorr(docID, signedDocID, message);
        assert.exists(signedMessage);
        assert.isNotEmpty(signedMessage);
    });

    it('should ecdsa sign a message', async () => {
        let message = sha256("bongocat").toString();
        let signedMessage = await ss.session.signEcdsa(docID, signedDocID, message);
        assert.exists(signedMessage);
        assert.isNotEmpty(signedMessage);
    });

    it('should compute hash of node ids', async () => {
        let theHash = await ss.serversSetHash([node1, node2]);
        assert.exists(theHash);
        assert.isNotEmpty(theHash);
    });

    xit('should change set of nodes (exclude charlie)', async () => {
        let nodeIDsNewSet = [node1, node2];
        let hashOldSet = await ss.serversSetHash([node1, node2, node3]);
        let hashNewSet = await ss.serversSetHash(nodeIDsNewSet);

        let signatureOldSet = await ss.signRawHash(admin, adminpwd, hashOldSet);
        let signatureNewSet = await ss.signRawHash(admin, adminpwd, hashNewSet);

        let res = await ss.session.nodesSetChange(
            nodeIDsNewSet,
            signatureOldSet,
            signatureNewSet
        );
        assert.exists(res);
    });

    xit('should change set of nodes back to original (charlie is back)', async () => {
        let nodeIDsNewSet = [node1, node2, node3];
        let hashOldSet = await ss.serversSetHash([node1, node2]);
        let hashNewSet = await ss.serversSetHash(nodeIDsNewSet);

        let signatureOldSet = await ss.signRawHash(admin, adminpwd, hashOldSet);
        let signatureNewSet = await ss.signRawHash(admin, adminpwd, hashNewSet);

        let res = await ss.session.nodesSetChange(
            nodeIDsNewSet,
            signatureOldSet,
            signatureNewSet
        );
        assert.exists(res);
    });
});

describe('Secret store wrong inputs test', async () => {

    async function trial(secretStore) {
        let docID = sha256("lololol").toString();
        let signedDocID = await secretStore.signRawHash(alice, alicepwd, docID);
        
        assert.exists(signedDocID);
        assert.isNotEmpty(signedDocID);
    };

    it('should still work without SS', async () => {
        let ss2 = new SecretStore(web3);
        await trial(ss2);
    });

    it('should truncate the ending /', async () => {
        let ss2 = new SecretStore(web3, "http://127.0.0.1:8090/");
        assert.equal(ss2.session.uri, "http://127.0.0.1:8090");
    });
});
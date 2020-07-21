import chaiAsPromised from 'chai-as-promised';
import * as chai from 'chai';
import { keccak256 } from 'js-sha3';
import { ethers } from 'ethers';

import assets from './assets';
import { SecretStoreSessionClient, SecretStoreRpcApiClient, DocumentKeyPortions, ExternallyEncryptedDocumentKey } from '../lib';

chai.use(chaiAsPromised);
const { assert, expect } = chai;

const { alice, admin } = assets.accounts;
const { alicepwd, adminpwd } = assets.passwords;
const { httpRpcAlice } = assets.httpRpc;
const { httpSSAlice } = assets.httpSS;
const { node1, node2, node3 } = assets.nodes;

const provider = new ethers.providers.JsonRpcProvider(httpRpcAlice);
const ss = new SecretStoreRpcApiClient(provider);
const ssSession = new SecretStoreSessionClient(httpSSAlice);

describe('Secret store correct inputs test', async () => {
    let hexDoc: string;
    let encryptedDoc: string;
    let docID: string;
    let signedDocID: string;
    let skey: string;
    let dkey: ExternallyEncryptedDocumentKey | string;
    let retrievedKey: string;
    let shadowRetrievedKey: DocumentKeyPortions;

    it('should instantiate with correct params', async () => {
        assert.exists(new SecretStoreRpcApiClient(httpRpcAlice));
    });

    it('should fail to instantiate with invalid params', async () => {
        assert.throws(() => new SecretStoreRpcApiClient(undefined));
        assert.throws(() => new SecretStoreSessionClient(undefined));
        assert.throws(() => new SecretStoreSessionClient(''));
    });

    it('should sign raw hash', async () => {
        docID = `0x${keccak256('lololol')}`;
        signedDocID = await ss.signRawHash(alice, alicepwd, docID);
        assert.exists(signedDocID);
        assert.isNotEmpty(signedDocID);
    });

    it('should generate server key', async () => {
        docID = keccak256(Math.random().toString()).toString();
        signedDocID = await ss.signRawHash(alice, alicepwd, docID);
        skey = await ssSession.generateServerKey(docID, signedDocID, 1);
        assert.exists(skey);
        assert.isNotEmpty(skey);
    });

    it('should retrieve generated server key public portion', async () => {
        docID = keccak256(Math.random().toString()).toString();
        signedDocID = await ss.signRawHash(alice, alicepwd, docID);
        skey = await ssSession.generateServerKey(docID, signedDocID, 1);
        assert.exists(skey);
        assert.isNotEmpty(skey);
        const skey2 = await ssSession.retrieveServerKeyPublic(docID, signedDocID);
        assert.exists(skey2);
        assert.isNotEmpty(skey2);
        assert.equal(skey, skey2);
    });

    it('should generate document key', async () => {
        dkey = await ss.generateDocumentKey(alice, alicepwd, skey);
        assert.exists(dkey);
        assert.isNotEmpty(dkey);
    });

    it('should fail to store document key with incorrect params', async () => {
        expect(ssSession.storeDocumentKey(docID, signedDocID, undefined, (dkey as ExternallyEncryptedDocumentKey).encrypted_point)).to
            .be.rejected;
        expect(ssSession.storeDocumentKey(docID, signedDocID, (dkey as ExternallyEncryptedDocumentKey).common_point, undefined)).to.be
            .rejected;
        expect(ssSession.storeDocumentKey(docID, signedDocID, '', '')).to.be.rejected;
    });

    it('should store the document key', async () => {
        const res = await ssSession.storeDocumentKey(
            docID,
            signedDocID,
            (dkey as ExternallyEncryptedDocumentKey).common_point,
            (dkey as ExternallyEncryptedDocumentKey).encrypted_point
        );
        assert.exists(res);
    });

    it('should do another document key store test', async () => {
        docID = keccak256(Math.random().toString()).toString();
        signedDocID = await ss.signRawHash(alice, alicepwd, docID);
        skey = await ssSession.generateServerKey(docID, signedDocID, 1);
        assert.exists(skey);
        assert.isNotEmpty(skey);
        dkey = await ss.generateDocumentKey(alice, alicepwd, skey);
        assert.exists(dkey);
        assert.isNotEmpty(dkey);
        const res = await ssSession.storeDocumentKey(docID, signedDocID, dkey);
        assert.exists(res);
    });

    it('should generate server and document key', async () => {
        docID = keccak256(Math.random().toString()).toString();
        signedDocID = await ss.signRawHash(alice, alicepwd, docID);
        dkey = await ssSession.generateServerAndDocumentKey(docID, signedDocID, 1);
        assert.exists(dkey);
        assert.isNotEmpty(dkey);
    });

    it('should not be able to generate same server and document key again', async () => {
        expect(ssSession.generateServerAndDocumentKey(docID, signedDocID, 1)).to.be.rejected;
    });

    it('should shadow retrieve document key', async () => {
        shadowRetrievedKey = await ssSession.shadowRetrieveDocumentKey(docID, signedDocID);
        assert.exists(shadowRetrievedKey);
        assert.isNotEmpty(shadowRetrievedKey);
    });

    it('should retrieve document key', async () => {
        retrievedKey = await ssSession.retrieveDocumentKey(docID, signedDocID);
        assert.exists(retrievedKey);
        assert.isNotEmpty(retrievedKey);
    });

    it('should encrypt a document', async () => {
        hexDoc = `0x${Buffer.from('lololololol').toString('hex')}`;
        encryptedDoc = await ss.encrypt(alice, alicepwd, hexDoc, retrievedKey);
        assert.exists(encryptedDoc);
        assert.isNotEmpty(encryptedDoc);
    });

    it('should decrypt a document', async () => {
        const decryptedDoc = await ss.decrypt(alice, alicepwd, encryptedDoc, retrievedKey);
        assert.exists(decryptedDoc);
        assert.isNotEmpty(decryptedDoc);
        assert.equal(decryptedDoc, hexDoc);
    });

    it('should shadow decrypt a document', async () => {
        const decryptedDoc = await ss.shadowDecrypt(
            alice,
            alicepwd,
            encryptedDoc,
            shadowRetrievedKey.decrypted_secret,
            shadowRetrievedKey.common_point,
            shadowRetrievedKey.decrypt_shadows
        );

        const decryptedDoc2 = await ss.shadowDecrypt(alice, alicepwd, encryptedDoc, shadowRetrievedKey);
        assert.exists(decryptedDoc);
        assert.isNotEmpty(decryptedDoc);
        assert.equal(decryptedDoc, hexDoc);
        assert.equal(decryptedDoc, decryptedDoc2);
    });

    it('should fail to shadow decrypt', async () => {
        expect(
            ss.shadowDecrypt(
                alice,
                alicepwd,
                encryptedDoc,
                shadowRetrievedKey.decrypted_secret,
                undefined,
                shadowRetrievedKey.decrypt_shadows
            )
        ).to.be.rejected;
        expect(
            ss.shadowDecrypt(
                alice,
                alicepwd,
                encryptedDoc,
                undefined,
                shadowRetrievedKey.common_point,
                shadowRetrievedKey.decrypt_shadows
            )
        ).to.be.rejected;
        expect(
            ss.shadowDecrypt(
                alice,
                alicepwd,
                encryptedDoc,
                shadowRetrievedKey.decrypted_secret,
                shadowRetrievedKey.common_point,
                []
            )
        ).to.be.rejected;
    });

    it('should schnorr sign a message', async () => {
        const message = keccak256('bongocat').toString();
        const signedMessage = await ssSession.signSchnorr(docID, signedDocID, message);
        assert.exists(signedMessage);
        assert.isNotEmpty(signedMessage);
    });

    it('should ecdsa sign a message', async () => {
        const message = keccak256('bongocat').toString();
        const signedMessage = await ssSession.signEcdsa(docID, signedDocID, message);
        assert.exists(signedMessage);
        assert.isNotEmpty(signedMessage);
    });

    it('should compute hash of node ids', async () => {
        const theHash = await ss.serversSetHash([node1, node2]);
        assert.exists(theHash);
        assert.isNotEmpty(theHash);
    });

    xit('should change set of nodes (exclude charlie)', async () => {
        const nodeIDsNewSet = [node1, node2];
        const hashOldSet = await ss.serversSetHash([node1, node2, node3]);
        const hashNewSet = await ss.serversSetHash(nodeIDsNewSet);

        const signatureOldSet = await ss.signRawHash(admin, adminpwd, hashOldSet);
        const signatureNewSet = await ss.signRawHash(admin, adminpwd, hashNewSet);

        const res = await ssSession.nodesSetChange(nodeIDsNewSet, signatureOldSet, signatureNewSet);
        assert.exists(res);
    });

    xit('should change set of nodes back to original (charlie is back)', async () => {
        const nodeIDsNewSet = [node1, node2, node3];
        const hashOldSet = await ss.serversSetHash([node1, node2]);
        const hashNewSet = await ss.serversSetHash(nodeIDsNewSet);

        const signatureOldSet = await ss.signRawHash(admin, adminpwd, hashOldSet);
        const signatureNewSet = await ss.signRawHash(admin, adminpwd, hashNewSet);

        const res = await ssSession.nodesSetChange(nodeIDsNewSet, signatureOldSet, signatureNewSet);
        assert.exists(res);
    });
});

describe('Secret store wrong inputs test', async () => {
    async function trial(secretStore: SecretStoreRpcApiClient) {
        const docID = `0x${keccak256('lololol').toString()}`;
        const signedDocID = await secretStore.signRawHash(alice, alicepwd, docID);

        assert.exists(signedDocID);
        assert.isNotEmpty(signedDocID);
    }

    it('should still work without SS', async () => {
        const ss2 = new SecretStoreRpcApiClient(provider);
        await trial(ss2);
    });

    it('should truncate the ending /', async () => {
        const ss2 = new SecretStoreSessionClient('http://127.0.0.1:8545/');
        assert.equal(ss2.url, 'http://127.0.0.1:8545');
    });
});

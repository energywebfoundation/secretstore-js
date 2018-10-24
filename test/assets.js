const path = require('path');
const fs = require("fs");

module.exports = {
    accounts: {
        alice: "0x3144de21da6de18061f818836fa3db8f3d6b6989",
        bob: "0x6c4b8b199a41b721e0a95df9860cf0a18732e76d",
        charlie: "0x8b2c16e09bfb011c5e4883cedb105124ccf01af7",
        admin: "0xb05577fc129a573025e261b3118f0955e41ebe2b",
    },
    passwords: {
        alicepwd: fs.readFileSync(path.join(__dirname, '../nodes_ss_dev/alice.pwd'), "utf-8"),
        bobpwd: fs.readFileSync(path.join(__dirname, '../nodes_ss_dev/bob.pwd'), "utf-8"),
        charliepwd: fs.readFileSync(path.join(__dirname, '../nodes_ss_dev/charlie.pwd'), "utf-8"),
        adminpwd: fs.readFileSync(path.join(__dirname, '../nodes_ss_dev/admin.pwd'), "utf-8"),
    },
    httpSS: {
        httpSSAlice: "http://127.0.0.1:8090",
        httpSSBob: "http://127.0.0.1:8091",
        httpSSCharlie: "http://127.0.0.1:8092",
    },
    httpRpc: {
        httpRpcAlice: "http://127.0.0.1:8545",
        httpRpcBob: "http://127.0.0.1:8547",
        httpRpcCharlie: "http://127.0.0.1:8549",
    },
    nodes: {
        node1: "0x22417f6b9ecbaafbd10f33797161aaf0b8e74a0ce3aea19bb32b92c081e82780346c6f4f7aa619a8b3841f057dac8d31b8f75a241357420b25e9420b3918ac4b",
        node2: "0x413ecc85852cc4087ac8527c76be43cba57a5015f7a48da29c9c9123877474f8ac2406657274abfeee68bfc31c791d44358830e5983a2dba8b4235bd03253f0e",
        node3: "0xdc7452498e4b90f1c20178a5ea73c9d38626cc3d2199b4a110ec88fdb000be6f7da81779a4bbd743772eada02d523db54f1bea31cdc915c20ec377eb5336be81",
    }
};
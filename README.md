# Parity Secret Store JS client 
This is an [npm JS package](https://www.npmjs.com/package/secretstore) for interacting with Parity's Secret Store.
It is an abstraction layer (API) on top of the official 
[secretstore RPC API](https://wiki.parity.io/JSONRPC-secretstore-module) and
[secretstore sessions](https://wiki.parity.io/Secret-Store).
Naming conventions follow the underlying APIs'.

The documentation is for this package and its functions. For more information on 
how Secret Store works, please refer to the [Parity wiki](https://github.com/paritytech/wiki). 
Most of the function descriptions have been copied from there.

## Maintainers
**Primary**: Adam Nagy (@ngyam)

## Documentation

https://energywebfoundation.github.io/secretstore-js/index.html

## Quickstart

In your project:
```bash
npm install secretstore
```

Then:
```javascript

const secretstore = require("secretstore");

// your web3 instance
// preferably your local node
const web3 = new (require('web3'))("http://127.0.0.1:8545");

// this is where a SS cluster node is listening for HTTP requests
const ss_endpoint_uri = "http://127.0.0.1:8090";

const ss = new secretstore.SecretStore(web3, ss_endpoint_uri);

// secretstore RPC API calls
ss.method..

// secretstore session calls
ss.session.method..

```

If you wonder how to set up a Secret Store cluster, check out the official [config guide](https://wiki.parity.io/Secret-Store-Configuration) and peek into the [nodes_ss_dev/](./nodes_ss_dev/) folder.

**Note:** [Non-session Secret Store RPC](https://wiki.parity.io/JSONRPC-secretstore-module) calls work with a regular Parity client too, which is not compiled with the special secretstore feature.

## Examples

- You can see some examples amongst the [tests](test/secretstore.js).
- The official Parity Secret Store tutorial was reproduced with this client in this repo: https://github.com/ngyam/tutorial-secretstore-privatetx

## Tested with
- Locally compiled Parity client from master branch [at this commit](https://github.com/paritytech/parity-ethereum/commit/4fec2f2fc26c0daf95f4d91cbbf55eeca74888fe), merged with [`ss_expose_retrieve_server_public` branch](https://github.com/paritytech/parity-ethereum/tree/ss_expose_retrieve_server_public) at [this commit](https://github.com/paritytech/parity-ethereum/commit/7c9d2794b1ebd0212f51e2c4687241c7536e980d).

## Contributing

Please read [contributing](./CONTRIBUTING.md) and our [code of conduct](./CODE_OF_CONDUCT.md) for details.

## Getting started (as a dev)

### Prerequisites

 - node, npm

### Installing

```bash
git clone https://github.com/energywebfoundation/secretstore-js.git
cd secretstore-js
npm install -D
```

## Running the tests

**ACHTUNG**: make sure to start the local secret store cluster first.

Your Secret Store enabled Parity client binary has to be placed in the root folder of the project with the name `parity`. It is shown in the [official tutorial](https://wiki.parity.io/Secret-Store-Tutorial-1.html#1-enable-the-secret-store-feature-of-parity) how to compile with Secret Store enabled. Use latest master branch preferably.

Then:

1. start nodes

``` bash
npm run start
```

2. run tests 

```bash
npm run test
```

3. When done fiddling around:

```bash
npm run stop
```
4. Optional: if you need to clean up chaindb/secretstore

```bash
npm run clear
```

To fill up the test accounts with some ethers, you can use the [nodes_ss_dev/funclocals.sh](nodes_ss_dev/funclocals.sh) script.

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## License

This project is licensed under GPLv3 - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

* Special thanks to Parity

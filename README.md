# EnergyWeb's Secret Store JS client 
Secret Store JS client, an [Npm package](https://www.npmjs.com/package/secretstore) for interacting with OpenEthereum's Secret Store `rpc` and `session` modules.
Abstraction layer on top of the official 
[secretstore RPC API](https://openethereum.github.io/wiki/JSONRPC-secretstore-module) and
[secretstore sessions](https://openethereum.github.io/wiki/Secret-Store).
Naming conventions follow the underlying APIs'.


## Maintainers
**Primary**: Adam Nagy (@ngyam)

## Documentation

https://energywebfoundation.github.io/secretstore-js/index.html

The documentation is for this package and its functions. For more information on 
how Secret Store works, please refer to the [OpenEthereum wiki](https://openethereum.github.io/wiki). 
Most of the function descriptions have been copied from there.

## Quickstart

In your project:
```bash
npm install secretstore
```
or

```bash
yarn add secretstore

```

### Then

Javascript
```javascript

const secretstore = require("secretstore");

// using the OpenEthereum's secretstore rpc module
// should be used on your local node for trust reasons
const sslac = new secretstore.SecretStoreRpcApiClient("http://127.0.0.1:8545");
sslac.<method>...

// using the OpenEthereum's secretstore session module
const sssc = new secretstore.SecretStoreSessionClient("http://127.0.0.1:8090");
sssc.<method>...
```

Typescript
```typescript

import {SecretStoreRpcApiClient, SecretStoreSessionClient} from "secretstore";

// using the OpenEthereum's secretstore rpc module
// should be used on your local node for trust reasons
const sslac = new SecretStoreRpcApiClient("http://127.0.0.1:8545");
sslac.<method>...

// using the OpenEthereum's secretstore session module
const sssc = new SecretStoreSessionClient("http://127.0.0.1:8090");
sssc.<method>...
```

If you wonder how to set up a Secret Store cluster, check out the official [config guide](https://openethereum.github.io/wiki/Secret-Store-Configuration) and peek into the [nodes_ss_dev/](./nodes_ss_dev/) folder.

**Note:** [Non-session Secret Store RPC](https://openethereum.github.io/wiki/JSONRPC-secretstore-module) calls work with a regular Parity client too, which is not compiled with the special secretstore feature.

## Examples

- You can see some examples amongst the [tests](test/secretstore.test.ts).
- The official Parity Secret Store tutorial was reproduced with this client in this repo: https://github.com/ngyam/tutorial-secretstore-privatetx

## Tested with
- Locally compiled [Parity client v2.6.8](https://github.com/openethereum/openethereum/releases/tag/v2.6.8).

## Contributing

Please read [contributing](./CONTRIBUTING.md) and our [code of conduct](./CODE_OF_CONDUCT.md) for details.

## Getting started (as a dev)

### Prerequisites

 - node, npm

### Installing

```bash
git clone https://github.com/energywebfoundation/secretstore-js.git
cd secretstore-js
yarn
```

## Running the tests

**ACHTUNG**: make sure to start the local secret store cluster first.

Your Secret Store enabled Parity/OpenEthereum client binary has to be placed in the root folder of the project with the name `parity`. It is shown in the [official tutorial](https://openethereum.github.io/wiki/Secret-Store-Tutorial-1.html#1-enable-the-secret-store-feature-of-parity) how to compile with Secret Store enabled. Use latest master branch preferably.

Then:

1. start nodes

``` bash
yarn start
```

2. run tests 

```bash
yarn test
```

3. When done fiddling around:

```bash
yarn stop
```
4. Optional: if you need to clean up chaindb/secretstore

```bash
yarn clear
```

To fill up the test accounts with some ethers, you can use the [nodes_ss_dev/funclocals.sh](nodes_ss_dev/funclocals.sh) script.

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## License

This project is licensed under GPL-3.0 - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

* Special thanks to Parity

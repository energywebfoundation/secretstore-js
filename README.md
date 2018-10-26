# Secret Store nodejs package
This is a [Node JS package](https://www.npmjs.com/package/secretstore) for interacting with Parity's Secret Store.
It is an abstraction layer (API) on top of the official 
[secretstore module RPC API](https://wiki.parity.io/JSONRPC-secretstore-module) and
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
const web3 = new (require('web3'))("http://127.0.0.1:8545");

// this is where the SS node is listening for requests
const ss_endpoint_uri = "http://127.0.0.1:8090";

const ss = new secretstore.SecretStore(web3, ss_endpoint_uri);

// secretstore RPC API calls
ss.method..

// secretstore session calls
ss.session.method..

```

If you wonder how to set up a Secret Store cluster, check out the official [config guide](https://wiki.parity.io/Secret-Store-Configuration) and peek into the [nodes_ss_dev/](./nodes_ss_dev/) folder.

## Examples

You can see some examples amongst the [tests](test/secretstore.js).

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

## Versioning

We use [SemVer](http://semver.org/) for versioning. Version number is bumped with `bumpversion` tool.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

* Special thanks to Parity

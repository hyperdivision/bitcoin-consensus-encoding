# `bitcoin-consensus-encoding`

[![Build Status](https://travis-ci.org/hyperdivision/bitcoin-consensus-encoding.svg?branch=master)](https://travis-ci.org/hyperdivision/bitcoin-consensus-encoding)
[![abstract-encoding](https://img.shields.io/badge/abstract--encoding-compliant-brightgreen.svg?style=flat)](https://github.com/mafintosh/abstract-encoding)

> Abstract encoding for Bitcoin related objects

## Usage

```js
var codec = require('bitcoin-consensus-encoding')

console.log(codec.varInt.encode(1e8), codec.varInt.encode.bytes)
console.log(codec.string.encode("Hello world"), codec.string.encode.bytes)
console.log(codec.boolean.encode(true), codec.boolean.encode.bytes)
```

## API

### ``

## Install

```sh
npm install bitcoin-consensus-encoding
```

## License

[ISC](LICENSE)

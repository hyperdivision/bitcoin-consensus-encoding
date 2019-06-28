var string = require('./string.js')
var int = require('./int.js')
var bool = require('./boolean.js')
var fs = require('fs')
var header = require('./example.json')

var headerKeys = {
  'title': 'string',
  'version': 'int16',
  'description': 'string',
  'contract_url': 'string',
  'issuance_utxo': 'bytes',
  'network': 'bytes',
  'total_supply': 'int64',
  'min_amount': 'int64',
  'max_hops': 'int32',
  'reissuance_enabled': 'bool',
  'reissuance_utxo': 'string',
  'burn_address': 'string',
  'commitment_scheme': 'string',
  'blueprint_type': 'string'
}

var optionals = [
  'description',
  'contract_url',
  'max_hops',
  'reissuance_utxo',
  'burn_address'
]

var types = {
  'string': string,
  'int16': int,
  'int32': int,
  'int64': int,
  'bool': bool
}

function encode (header, buf, offset) {
  if (!buf) buf = Buffer.alloc(encodingLength(header))
  if (!offset) offset = 0

  string.encode(header['title'], buf, offset)
  offset += string.encode.bytes

  int.encode(header['version'], buf, offset, 16)
  offset += int.encode.bytes

  if (header['description']) {
    string.encode(header['description'], buf, offset)
    offset += string.encode.bytes
  } else {
    string.encode('', buf, offset)
    offset++
  }

  if (header['contract_url']) {
    string.encode(header['contract_url'], buf, offset)
    offset += string.encode.bytes
  } else {
    string.encode('', buf, offset)
    offset++
  }

  string.encode(header['issuance_utxo'], buf, offset, true)
  offset += string.encode.bytes

  string.encode(header['network'], buf, offset, true)
  offset += string.encode.bytes

  int.encode(BigInt(header['total_supply']), buf, offset, 64)
  offset += int.encode.bytes

  int.encode(BigInt(header['min_amount']), buf, offset, 64)
  offset += int.encode.bytes

  if (header['max_hops'] || header['max_hops'] === 0) {
    int.encode(header['max_hops'], buf, offset, 32)
    offset += int.encode.bytes
  } else {
    buf.writeUInt8(0, offset)
    offset++
  }

  bool.encode(header['reissuance_enabled'], buf, offset)
  offset += bool.encode.bytes

  if (header['reissuance_utxo']) {
    string.encode(header['reissuance_utxo'], buf, offset)
    offset += string.encode.bytes
  } else {
    string.encode('', buf, offset)
    offset++
  }

  if (header['burn_address']) {
    string.encode(header['burn_address'], buf, offset)
    offset += string.encode.bytes
  } else {
    string.encode('', buf, offset)
    offset++
  }

  offset += string.encode.bytes

  string.encode(header['blueprint_type'], buf, offset)
  offset += string.encode.byt

  return buf
}

function decode (buf, offset) {
  if (!offset) offset = 0
  var contract = {}
  // console.log(offset)

  contract['title'] = string.decode(buf, offset)
  offset += string.decode.bytes
  // console.log(offset, 'title')

  contract['version'] = int.decode(buf, offset, 2)
  offset += int.decode.bytes
  // console.log(offset, 'version')

  contract['description'] = string.decode(buf, offset)
  offset += string.decode.bytes
  // console.log(offset, 'description')

  contract['contract_url'] = string.decode(buf, offset)
  offset += string.decode.bytes
  // console.log(offset, 'contract_url')

  contract['issuance_utxo'] = string.decode(buf, offset, 3)
  offset += string.decode.bytes

  contract['network'] = string.decode(buf, offset, 3)
  offset += string.decode.bytes
  // console.log(offset, 'network', buf.subarray(offset - 3, offset))

  contract['total_supply'] = int.decode(buf, offset, 8)
  offset += int.decode.bytes
  // console.log(offset, 'total_supply')

  contract['min_amount'] = int.decode(buf, offset, 8)
  offset += int.decode.bytes
  // console.log(offset, 'min_amount')

  contract['max_hops'] = int.decode(buf, offset, 4)
  offset += int.decode.bytes

  contract['reissuance_enabled'] = bool.decode(buf, offset)
  offset += bool.decode.bytes

  contract['reissuance_utxo'] = string.decode(buf, offset)
  offset += string.decode.bytes

  contract['burn_address'] = string.decode(buf, offset)
  offset += string.decode.bytes

  contract['commitment_scheme'] = string.decode(buf, offset)
  offset += string.decode.bytes

  contract['blueprint_type'] = string.decode(buf, offset)
  offset += string.decode.bytes

  return contract
}

function encodingLength (header) {
  var length = 0
  length += string.encodingLength(header['title'])
  length += int.encodingLength(16)
  if (header['description']) {
    length += string.encodingLength(header['description'])
  } else {
    length++
  }
  if (header['contract_url']) {
    length += string.encodingLength(header['contract_url'])
  } else {
    length++
  }
  const issuanceUTXObytes = Buffer.from(header['issuance_utxo'])
  length += issuanceUTXObytes.byteLength
  const networkBytes = Buffer.from(header['network'])
  length += networkBytes.byteLength
  length += int.encodingLength(64)
  length += int.encodingLength(64)
  if (header['max_hops']) {
    length += int.encodingLength(32)
  } else {
    length++
  }
  length += bool.encodingLength()
  if (header['reissuance_utxo']) {
    length += string.encodingLength(header['reissuance_utxo'])
  } else {
    length++
  }
  if (header['burn_address']) {
    length += string.encodingLength(header['burn_address'])
  } else {
    length++
  }
  length += string.encodingLength(header['commitment_scheme'])
  length += string.encodingLength(header['blueprint_type'])

  return length
}

// var exampleScript = fs.readFileSync('./example.contract')
var encoded = encode(header)
console.log(encoded.toString('hex'))
var decoded = decode(encoded)
console.log(decoded)

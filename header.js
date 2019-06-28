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

  console.log(offset)

  string.encode(header['issuance_utxo'], buf, offset, true)
  offset += string.encode.bytes

  string.encode(header['network'], buf, offset, true)
  offset += string.encode.bytes

  int.encode(BigInt(header['total_supply']), buf, offset, 64)
  offset += int.encode.bytes

  int.encode(BigInt(header['min_amount']), buf, offset, 64)
  console.log(int.encode(BigInt(header['min_amount']), null, null, 64))
  offset += int.encode.bytes

  if (header['max_hops']) {
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

// function encode (header, buf, offset) {
//   if (!buf) buf = Buffer.alloc(encodingLength(header))
//   if (!offset) offset = 0

//   for (var key in headerKeys) {
//     console.log(key, 'check')
//     var bits
//     var type = headerKeys[key]
//     if (types[type] === int) bits = parseInt(type.substring(3))

//     if (optionals.includes(key)) {
//       if (type === 'string') {
//         if (header.hasOwnProperty(key)) {
//           console.log(offset, key, header[key], buf, (!buf || offset !== 0))
//           string.encode(header[key], buf, offset)
//         } else {
//           string.encode('', buf, offset)
//         }
//         offset += string.encode.bytes
//       } else {
//         if (header.hasOwnProperty(key)) {
//           buf.writeUInt8(1, offset)
//           int.encode(header[key], buf, offset, bits)
//           offset += int.encode.bytes + 1
//         } else {
//           buf.writeUInt8(0, offset)
//           offset++
//         }
//       }
//     } else {
//       if (types[type] === 'int') {
//         bits = parseInt(type.substring(3))
//         types[type].encode(header[key], buf, offset, bits)
//         offset += types[type].encode.bytes
//       } else if (type === 'bytes') {
//         string.encode(header[key], buf, offset, true)
//         offset += string.encode.bytes
//       } else {
//         console.log(type, buf.subarray(30))
//         types[type].encode(header[key], buf, offset)
//         offset += types[type].encode.bytes
//       }
//     }
//   }
// }

function decode (buf, offset) {
  if (!offset) offset = 0
  var contract = {}
  console.log(offset)

  contract['title'] = string.decode(buf, offset)
  offset += string.decode.bytes
  console.log(offset)

  contract['version'] = int.decode(buf, offset, 2)
  offset += int.decode.bytes

  contract['description'] = string.decode(buf, offset)
  offset += string.decode.bytes

  contract['contract_url'] = string.decode(buf, offset)
  offset += string.decode.bytes
  console.log(offset)

  contract['issuance_utxo'] = string.decode(buf, offset, 5)
  console.log(buf.subarray(offset, offset + 5), buf.subarray(offset, offset + 5).toString())
  offset += 5

  contract['network'] = string.decode(buf, offset, 5)
  offset += 5

  contract['total_supply'] = int.decode(buf, offset, 8)
  console.log(offset, buf.subarray(offset, offset + 8), 'boo')
  offset += int.decode.bytes

  contract['min_amount'] = int.decode(buf, offset, 8)
  offset += int.decode.bytes

  contract['max_hops'] = int.decode(buf, offset, 4)
  offset += int.decode.bytes

  contract['reissuance_enabled'] = bool.decode(buf, offset)
  offset += bool.decode.bytes

  contract['reissuance_utxo'] = string.decode(buf, offset)
  offset += string.decode.bytes
  console.log(string.decode.bytes, 'problem')

  contract['burn_address'] = string.decode(buf, offset)
  offset += string.decode.bytes

  contract['commitment_scheme'] = string.decode(buf, offset)
  offset += string.decode.bytes

  contract['blueprint_type'] = string.decode(buf, offset)
  offset += string.decode.bytes

  // for (var key of Object.keys(headerKeys)) {
  //   var type = headerKeys[key]
  //   var byteLength
  //   console.log(offset, key)

  //   switch (type) {
  //     case 'int16' : {
  //       byteLength = 2
  //       break
  //     }

  //     case 'int32' : {
  //       byteLength = 4
  //       break
  //     }

  //     case 'int64' : {
  //       byteLength = 8
  //       break
  //     }
  //   }

  //   if (optionals.includes(key)) {
  //     if (!buf.readUInt8(offset)) {
  //       offset++
  //     } else if (types[type] === int) {
  //       contract[key] = int.decode(buf, offset, 4)
  //       offset += int.decode.bytes
  //     } else {
  //       contract[key] = types[type].decode(buf, offset - 2)
  //       offset += types[type].decode.bytes
  //     }
  //   } else {
  //     if (types[type] === int) {
  //       contract[key] = int.decode(buf, offset, byteLength)
  //       offset += int.decode.bytes
  //     } else {
  //       contract[key] = types[type].decode(buf, offset)
  //       offset += types[type].decode.bytes
  //     }
  //   }
  // }
  return contract
}

// function encodingLength (header) {
//   var length = 0
//   console.log(headerKeys)
//   for (var key in headerKeys) {
//     console.log(length, key)
//     if (Object.keys(header).includes(key)) {
//       var type = headerKeys[key]
//       if (type === 'bytes') {
//         length += header[key].length / 2
//       } else {
//         types[type].encode(header[key])
//         length += types[type].encode.bytes
//       }
//     }
//     if (optionals.includes(key)) length++
//   }
//   console.log(length)
//   return length
// }

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

// now redundant
// function encoder (header, key, buf, offset) {
//   switch (headerKeys[key].substring(0, 3)) {
//     case 'str' : {
//       if (!header.hasOwnProperty(key)) {
//         string.encode('', buf, offset)
//       }
//       string.encode(header[key], buf, offset)
//       return string.encode.bytes
//     }

//     case 'int' : {
//       var bits = parseInt(headerField[key].substring(3))
//       var flag = 0

//       // correctly format
//       if (key == 'max_hops' && header.hasOwnProperty(key)) {
//         buf.writeUInt8(1, offset)
//         flag++
//       } else if (key = 'max_hops') {
//         buf.writeUInt8(0, offset)
//         return 1
//         break
//       }

//       int.encode(header[key], buf, offset, bits)
//       return int.encode.bytes + flag
//     }

//     case 'boo' : {
//       bool.encode(header[key], buf, offset)
//       return bool.encode.bytes
//     }

//     case 'byt' : {
//       buf.set(header[key], offset)
//       return header[key].byteLength
//     }
//   }
// }



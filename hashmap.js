var assert = require('nanoassert')
var bigUIntLE = require('biguintle')
var varint = require('./var-int.js')
var string = require('./string')
var boolean = require('./boolean.js')
var int = require('./int.js')

function encode (hashmap, buf, offset) {
  assert(hashmap instanceof Map, 'hashmap must be an instance of Map')
  var length = encodingLength(hashmap)
  if (!buf) buf = Buffer.alloc(length)
  if (!offset) offset = 0

  var entries = int.encode(BigInt(hashmap.size), null, null, 64)
  var header = Buffer.alloc(8, entries)

  buf.set(header, offset)
  offset += 8

  for (var [key, value] of hashmap) {
    var encodedKey = encoding(key)
    var writeKey = Buffer.concat([encoding.type, encodedKey])
    buf.set(writeKey, offset)

    offset += encoding.bytes

    var encodedValue = encoding(value)
    var writeValue = Buffer.concat([encoding.type, encodedValue])
    buf.set(writeValue, offset)

    offset += encoding.bytes
  }

  encode.bytes = length
  return buf
}

function decode (buf, offset) {
  assert(Buffer.isBuffer(buf), 'buf must be an instance of Buffer')
  if (!offset) offset = 0

  console.log(buf, 'input buffer')
  var entries = int.decode(buf, offset, 8)
  console.log(entries)
  var hashmap = new Map()
  offset += 8

  for (var i = 0; i < entries * 2n; i++) {
    if (i % 2 === 0) {
      var key = decoding(buf, offset)
    } else {
      var value = decoding(buf, offset)
      hashmap.set(key, value)
    }
    offset += decoding.bytes
  }
  return hashmap
}

function encodingLength (hashmap) {
  var length = 9
  for (var [key, value] of hashmap) {
    encoding(key)
    length += encoding.bytes

    encoding(value)
    length += encoding.bytes
  }
  return length
}

function encoding (item) {
  const validTypes = ['string', 'bigint', 'boolean', 'number']
  assert(validTypes.includes(typeof item), 'invalid input')

  var encodedItem
  var encodedType = Buffer.alloc(1)

  switch (typeof item) {
    case ('number' || 'bigint') :
      encodedItem = varint.encode(item)
      encoding.bytes = varint.encode.bytes + 1
      encodedType.writeUInt8(0)
      break

    case 'string' :
      encodedItem = string.encode(item)
      encoding.bytes = string.encode.bytes + 1
      encodedType.writeUInt8(1)
      break

    case 'boolean' :
      encodedItem = boolean.encode(item)
      encoding.bytes = boolean.encode.bytes + 1
      encodedType.writeUInt8(2)
      break
  }
  encoding.type = encodedType
  return encodedItem
}

function decoding (item, offset) {
  assert(Buffer.isBuffer(item), 'unknown input type')

  var decodedItem
  var encodedType = item.readUInt8(offset)

  switch (encodedType) {
    case 0 : {
      decodedItem = varint.decode(item, offset + 1)
      decoding.bytes = varint.decode.bytes + 1
      break
    }

    case 1 : {
      decodedItem = string.decode(item, offset + 1)
      decoding.bytes = string.decode.bytes + 1
      break
    }

    case 2 : {
      decodedItem = boolean.decode(item, offset + 1)
      decoding.bytes = boolean.decode.bytes + 1
      break
    }
  }
  return decodedItem
}

var hashmap = new Map()

for (var i = 0; i < 10000; i++) {
  hashmap.set(i, i * 2)
}

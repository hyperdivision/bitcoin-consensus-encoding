var assert = require('nanoassert')
var bigUIntLE = require('biguintle')
var varint = require('./var-int.js')
var string = require('./string')
var boolean = require('./boolean.js')
var int = require('./int.js')

// encode hashmap with key/value types specified - numbers: 0, strings: 1
function encode (hashmap, keyType, valueType, buf, offset) {
  assert(!buf || offset === 0, 'offset must be specified to overwrite buf')
  assert(hashmap instanceof Map, 'hashmap must be an instance of Map')
  var length = encodingLength(hashmap, keyType, valueType)
  if (!buf) buf = Buffer.alloc(length)
  if (!offset) offset = 0

  var entries = int.encode(BigInt(hashmap.size), null, null, 64)
  var header = Buffer.alloc(8, entries)

  buf.set(header, offset)
  offset += 8

  for (var [key, value] of hashmap) {
    for (item of [key, value]) {
      var encodedKey = encodeItem(key, keyType)
      buf.set(encodedKey, offset)

      offset += encodeItem.bytes
    }
  }

  encode.bytes = length
  return buf
}

// pass an consensus-encoded hashmap as a buffer
// specify key/value types - numbers: 0, strings: 1
function decode (buf, keyType, valueType, offset) {
  assert(Buffer.isBuffer(buf), 'buf must be an instance of Buffer')
  if (!offset) offset = 0

  var entries = int.decode(buf, offset, 8)
  var hashmap = new Map()
  offset += 8

  for (var i = 0; i < entries * 2n; i++) {
    if (i % 2 === 0) {
      var key = decodeItem(buf, keyType, offset)
    } else {
      var value = decodeItem(buf, valueType, offset)
      hashmap.set(key, value)
    }
    offset += decodeItem.bytes
  }
  return hashmap
}

// returns the number of bytes required to encode a given hashmap
// requires double computing as the length of each entry is unknown
function encodingLength (hashmap, keyType, valueType) {
  var length = 8
  for (var [key, value] of hashmap) {
    encodeItem(key, keyType)
    length += encodeItem.bytes

    encodeItem(value, valueType)
    length += encodeItem.bytes
  }
  return length
}

// function to encode a particular key/value
function encodeItem (item, type) {
  assert([0, 1].includes(type), 'kv types must be specified')
  const validTypes = ['bigint', 'number']
  assert(validTypes.includes(typeof item), 'invalid input')

  var encodedItem

  switch (type) {
    case 0 : {
      encodedItem = varint.encode(item)
      encodeItem.bytes = varint.encode.bytes
      break
    }

    case 1 : {
      encodedItem = string.encode(item)
      encodeItem.bytes = string.encode.bytes
      break
    }
  }

  return encodedItem
}

// function to decode a given key/value
function decodeItem (item, type, offset) {
  assert([0, 1].includes(type), 'kv types must be specified')
  assert(Buffer.isBuffer(item), 'unknown input type')

  var decodedItem

  switch (type) {
    case 0 : {
      decodedItem = varint.decode(item, offset)
      decodeItem.bytes = varint.decode.bytes
      break
    }

    case 1 : {
      decodedItem = string.decode(item, offset)
      decodeItem.bytes = string.decode.bytes
      break
    }
  }

  return decodedItem
}

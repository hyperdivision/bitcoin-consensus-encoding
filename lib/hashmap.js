const assert = require('nanoassert')
// var bigUIntLE = require('biguintle')
const varint = require('./var-int.js')
const string = require('./string')
// var boolean = require('./boolean.js')
const int = require('./int.js')
// var contract = require('./contract.json')

module.exports = {
  encode,
  decode,
  encodingLength
}

// encode hashmap with key/value types specified - numbers: 0, strings: 1
function encode (hashmap, keyType, valueType, buf, offset) {
  assert(!buf || offset === 0, 'offset must be specified to overwrite buf')
  // assert(hashmap instanceof Map, 'hashmap must be an instance of Map')
  const length = encodingLength(hashmap, keyType, valueType)
  if (!buf) buf = Buffer.alloc(length)
  if (!offset) offset = 0

  const entries = int.encode(BigInt(hashmap.size), null, null, 64)
  const header = Buffer.alloc(8, entries)

  buf.set(header, offset)
  offset += 8

  for (const [key, value] of hashmap) {
    for (const item of [key, value]) {
      const encodedKey = encodeItem(item, keyType)
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

  const entries = int.decode(buf, offset, 8)
  const hashmap = new Map()
  offset += 8

  for (let i = 0; i < entries * 2; i++) {
    if (i % 2 === 0) {
      var key = decodeItem(buf, keyType, offset)
    } else {
      const value = decodeItem(buf, valueType, offset)
      hashmap.set(key, value)
    }
    offset += decodeItem.bytes
  }
  return hashmap
}

// returns the number of bytes required to encode a given hashmap
// requires double computing as the length of each entry is unknown
function encodingLength (hashmap, keyType, valueType) {
  let length = 8
  for (const [key, value] in hashmap) {
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

  let encodedItem

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

  let decodedItem

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

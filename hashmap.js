var assert = require('nanoassert')
var bigUIntLE = require('biguintle')
var varint = require('./var-int.js')
var string = require('./string')
var boolean = require('./boolean.js')

function encode (hashmap, buf, offset) {
  assert(hashmap instanceof Map, 'hashmap must be an instance of Map')
  var length = encodingLength(hashmap)
  if (!buf) buf = Buffer.alloc(length)
  if (!offset) offset = 0

  var entries = varint.encode(hashmap.size)
  // TODO: write int encoder - encode entries as u64 directly -> header  = Buffer.alloc(8)
  var header = Buffer.alloc(9)
  header.writeUInt8(0xff, 0)

  // encode number of entries as UInt64: in line with to rust-bitcoin lib
  // unnecessary with int.encode
  switch (varint.encode.bytes) {
    case 1 :
      header.fill(entries, 1, 2)
      break

    case 3 :
      header.set(entries.subarray(1), 1, 3)
      break

    case 5 :
      header.fill(entries.subarray(1), 1, 5)
      break

    case 9 :
      header.fill(entries)
      break
  }

  buf.set(header, offset)
  offset += 9

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

  // TODO: use int64 decode -> offset += 8
  var entries = varint.decode(buf, offset)
  var hashmap = new Map()
  offset += 9

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
  // var validTypes = ['string']
  const validTypes = ['string', 'bigint', 'boolean', 'number']
  assert(validTypes.includes(typeof item), 'invalid input')
  // assert((typeof item === 'string') ||
  // (typeof item = 'bigint') ||
  // (typeof = 'boolean') || (Number.isInteger(item)), 'unknown input type')

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

var testEncode = encode(hashmap)
var testDecode = decode(testEncode)
console.log(testDecode)

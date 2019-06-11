var assert = require('nanoassert')
var bigUIntLE = require('biguintle')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}

function encode (number, buf, offset) {
  // eslint-disable-next-line valid-typeof
  assert(Number.isInteger(number) || typeof number === 'bigint', 'input must be of type Integer')
  // HACK: Using the BigInt function to get around standard for now
  assert((number >= 0 && number < BigInt('0xffffffffffffffff')), 'input out of range')

  var minLength = encodingLength(number)
  if (!buf) buf = Buffer.alloc(minLength)
  assert(Buffer.isBuffer(buf), 'buf must be a Buffer instance.')
  assert(buf.byteLength >= minLength, 'buf must be long enough to contain number')
  if (!offset) offset = 0

  // 8 bit
  if (number < 0xfd) {
    buf.writeUInt8(number, offset)
    encode.bytes = 1
    return buf
  }

  // 16 bit
  if (number < 0xffff) {
    buf.writeUInt8(0xfd, offset)
    buf.writeUInt16LE(number, offset + 1)
    encode.bytes = 3
    return buf
  }

  // 32 bit
  if (number < 0xffffffff) {
    buf.writeUInt8(0xfe, offset)
    buf.writeUInt32LE(number, offset + 1)
    encode.bytes = 5
    return buf
  }

  // 64 bit
  buf.writeUInt8(0xff, offset)
  bigUIntLE.encode(BigInt(number), buf, offset + 1)
  encode.bytes = 9
  return buf
}

function encodingLength (number) {
  return number < 0xfd ? 1
    : number < 0xffff ? 3
      : number < 0xffffffff ? 5
        : 9
}

function decode (buf, offset) {
  assert(Buffer.isBuffer(buf), 'buf must be a Buffer instance.')
  if (!offset) offset = 0

  var first = buf.readUInt8(offset)

  if (first < 0xfd) {
    decode.bytes = 1
    return first
  }

  if (first === 0xfd) {
    decode.bytes = 3
    return buf.readUInt16LE(offset + 1)
  }

  if (first === 0xfe) {
    decode.bytes = 5
    return buf.readUInt32LE(offset + 1)
  }

  if (first === 0xff) {
    decode.bytes = 9
    return bigUIntLE.decode(buf, offset + 1)
  }
}

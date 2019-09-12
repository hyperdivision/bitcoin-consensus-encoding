var assert = require('nanoassert')
var int = require('./int.js')

module.exports = {
  encode,
  decode,
  encodingLength
}

function encode (number, buf, offset) {
  assert(!(buf && offset === undefined), 'offset must be specified to overwrite buf')
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
    buf.writeUInt16BE(number, offset + 1)
    encode.bytes = 3
    return buf
  }

  // 32 bit
  if (number < 0xffffffff) {
    buf.writeUInt8(0xfe, offset)
    buf.writeUInt32BE(number, offset + 1)
    encode.bytes = 5
    return buf
  }

  // 64 bit
  buf.writeUInt8(0xff, offset)
  int.encode(BigInt(number), buf, offset + 1, 64)
  encode.bytes = 9
  return buf
}

function encodingLength (number) {
  if (number < 0xfd) return 1
  if (number < 0xffff) return 3
  if (number < 0xffffffff) return 5
  return 9
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
    return buf.readUInt16BE(offset + 1)
  }

  if (first === 0xfe) {
    decode.bytes = 5
    return buf.readUInt32BE(offset + 1)
  }

  if (first === 0xff) {
    decode.bytes = 9
    return int.decode(buf, offset + 1, 8)
  }
}

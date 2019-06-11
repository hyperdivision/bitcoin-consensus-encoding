var assert = require('nanoassert')
var varint = require('./var-int.js')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}

function encode (string, buf, offset) {
  if (!buf) buf = Buffer.alloc(encodingLength(string))
  if (!offset) offset = 0

  var stringBytes = Buffer.from(string)
  varint.encode(stringBytes.byteLength, buf, offset)
  buf.set(stringBytes, offset + varint.encode.bytes)
  encode.bytes = varint.encode.bytes + stringBytes
  return buf
}

function encodingLength (string) {
  if (Buffer.isBuffer(string) === false) string = Buffer.from(string)
  return varint.encodingLength(string.byteLength) + string.byteLength
}

function decode (buf, offset) {
  assert(Buffer.isBuffer(buf), 'buf must be an instance of Buffer')
  if (!offset) offset = 0
  var first = buf.readUInt8(offset)

  if (first < 0xfd) {
    return buf.toString('utf8', offset + 1)
  }

  if (first === 0xfd) {
    return buf.toString('utf8', offset + 3)
  }

  if (first === 0xfe) {
    return buf.toString('utf8', offset + 5)
  }

  if (first === 0xff) {
    return buf.toString('utf8', offset + 9)
  }
}

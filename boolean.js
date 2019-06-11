var assert = require('nanoassert')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}

function encode (bool, buf, offset) {
  assert(typeof bool === 'boolean', 'bool must be a boolean')
  if (!buf) buf = Buffer.alloc(1)
  if (!offset) offset = 0

  buf[offset] = bool ? 1 : 0
  encode.bytes = 1
  return buf
}

function decode (buf, offset) {
  assert(Buffer.isBuffer(buf), 'buf must be an instance of Buffer')
  if (!offset) offset = 0
  let readValue = buf.readUInt8(offset)

  decode.bytes = 1
  return (readValue === 1)
}

function encodingLength () {
  return 1
}

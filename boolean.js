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

  let writeValue = bool ? 1 : 0
  buf.set(writeValue, offset)
  return buf
}

function decode (buf, offset) {
  assert(Buffer.isBuffer(buf), 'buf must be an instance of Buffer')
  if (!offset) offset = 0
  let readValue = buf.readUInt8(offset)

  return (readValue === 1)
}

function encodingLength () {
  return 1
}

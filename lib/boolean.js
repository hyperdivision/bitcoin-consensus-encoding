const assert = require('nanoassert')

module.exports = {
  encode,
  decode,
  encodingLength
}

function encode (bool, buf, offset) {
  assert(!(buf && offset === undefined), 'offset must be specified to overwrite buf')
  assert(typeof bool === 'boolean', 'bool must be a boolean')
  if (!buf) buf = Buffer.alloc(1)
  if (!offset) offset = 0

  if (bool) { buf.writeUInt8(1, offset) } else { buf.writeUInt8(0, offset) }
  encode.bytes = 1
  return buf
}

function decode (buf, offset) {
  assert(Buffer.isBuffer(buf), 'buf must be an instance of Buffer')
  if (!offset) offset = 0
  const readValue = buf.readUInt8(offset)

  decode.bytes = 1
  return (readValue === 1)
}

function encodingLength (bool) {
  return 1
}

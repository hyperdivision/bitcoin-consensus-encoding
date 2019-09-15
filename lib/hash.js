const assert = require('nanoassert')
const reverse = require('buffer-reverse')

module.exports = {
  encode,
  decode,
  encodingLength
}

function encode (hash, buf, offset) {
  if (!Buffer.isBuffer(hash)) {
    hash = Buffer.from(hash)
  }

  if (!buf) buf = Buffer.alloc(encodingLength(hash))
  if (!offset) offset = 0
  const startIndex = offset

  buf.set(hash, offset)
  offset += hash.byteLength

  encode.bytes = offset - startIndex
  return buf
}

function decode (buf, offset, byteLength) {
  assert(byteLength, 'expected byte length must be provided')
  decode.bytes = byteLength
  return buf.subarray(offset, offset + byteLength)
}

function encodingLength (hash) {
  return hash.byteLength
}

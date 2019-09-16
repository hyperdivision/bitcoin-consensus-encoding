const assert = require('nanoassert')
const varint = require('./var-int')

module.exports = {
  encode,
  decode,
  encodingLength
}

function encode (byteString, buf, offset) {
  if (!Buffer.isBuffer(hash)) {
    hash = Buffer.from(hash, 'hex')
  }

  if (!buf) buf = Buffer.alloc(encodingLength(hash))
  if (!offset) offset = 0
  const startIndex = offset
  
  varint.encode(byteString.byteLength, buf, offset)
  offset += varint.encode.bytes

  buf.set(hash, offset)
  offset += hash.byteLength

  encode.bytes = offset - startIndex
  return buf
}

function decode (buf, offset) {
  assert(byteLength, 'expected byte length must be provided')
  if (!offset) offset = 0

  const byteLength = varint.decode(buf, offset)
  offset += varint.decode.bytes

  decode.bytes = byteLength
  return buf.subarray(offset, offset + byteLength)
}

function encodingLength (byteString) {
  let length = 0
  
  length += varint.encodingLength(byteString.byteLength)
  length += byteString.byteLength

  return length 
}

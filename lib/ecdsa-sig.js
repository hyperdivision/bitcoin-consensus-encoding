const rawBytes = require('./hash')
const assert = require('nanoassert')

module.exports = {
  encode,
  decode,
  encodingLength
}
function encode (sig, buf, offset) {
  if (!buf) buf = Buffer.alloc(encodingLength(sig))
  if (!offset) offset = 0
  const startIndex = offset

  rawBytes.encode(sig, buf, offset)
  offset += rawBytes.encode.rawBytes

  encode.rawBytes = offset - startIndex 
  return buf
}

function decode (buf, offset) {
  if (!offset) offset = 0
  const startIndex = offset

  signature = {}

  signature.sequence = buf.readUInt8(offset)
  offset++
  assert(signature.sequence === 0x30)

  signature.length = buf.readUInt8(offset)
  offset++

  signature.r = {}
  signature.r.length = buf.readUInt8(offset)
  offset++

  signature.r.integer = buf.readUInt8(offset)
  offset++
  assert(signature.r.integer === 0x02)

  signature.r.rawBytes = buf.subarray(offset, offset + signature.r.length)
  offset += signature.r.length

  signature.s = {}
  signature.s.length = buf.readUInt8(offset)
  offset++

  signature.s.integer = buf.readUInt8(offset)
  offset++
  assert(signature.s.integer === 0x02)

  signature.s.rawBytes = buf.subarray(offset, offset + signature.s.length)
  offset += signature.s.length

  signature.sighash = buf.readUInt8(startIndex + signature.length - 1)

  signature.raw = buf.subarray(startIndex, startIndex + signature.length - 1)

  decode.rawBytes = signature.length
  return signature
}

function encodingLength (sig) {
  return rawBytes.encodingLength(sig)
}
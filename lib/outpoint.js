const assert = require('nanoassert')
const varint = require('./var-int.js')
const string = require('./string.js')

module.exports = {
  encode,
  decode,
  encodingLength
}

function encode (outpoint, buf, offset) {
  if (!buf) buf = Buffer.alloc(encodingLength(outpoint))
  if (!offset) offset = 0
  const start = offset

  string.encode(outpoint.txid, buf, offset, 32)
  offset += string.encode.bytes

  varint.encode(outpoint.vout, buf, offset)
  offset += varint.encode.bytes

  encode.bytes = offset - start
  return buf
}

function decode (buf, offset) {
  if (!offset) offset = 0
  const start = offset

  const outpoint = {}

  outpoint.txid = string.decode(buf, offset, 32)
  offset += string.decode.bytes

  outpoint.vout = varint.decode(buf, offset, 4)
  offset += varint.decode.bytes

  decode.bytes = offset - start
  return outpoint
}

function encodingLength (outpoint) {
  assert(outpoint.txid && outpoint.vout, 'invalid outpoint provided.')

  let length = 32
  length += varint.encodingLength(outpoint.vout)

  return length
}

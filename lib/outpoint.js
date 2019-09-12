var assert = require('nanoassert')
var int = require('./int.js')
var string = require('./string.js')

module.exports = {
  encode,
  decode,
  encodingLength
}

function encode (outpoint, buf, offset) {
  if (!buf) buf = Buffer.alloc(encodingLength(outpoint))
  if (!offset) offset = 0
  var start = offset

  string.encode(outpoint.txid, buf, offset, 32)
  offset += string.encode.bytes

  int.encode(outpoint.vout, buf, offset, 32)
  offset += int.encode.bytes

  encode.bytes = offset - start
  return buf
}

function decode (buf, offset) {
  if (!offset) offset = 0
  var start = offset

  var outpoint = {}

  outpoint.txid = string.decode(buf, offset, 32)
  offset += string.decode.bytes

  outpoint.vout = int.decode(buf, offset, 4)
  offset += int.decode.bytes

  decode.bytes = offset - start
  return outpoint
}

function encodingLength (outpoint) {
  assert(outpoint.txid && outpoint.vout, 'invalid outpoint provided.')

  return 36
}

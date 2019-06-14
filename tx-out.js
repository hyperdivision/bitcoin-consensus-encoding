var assert = require('nanoassert')
var int = require('./int.js')
var string = require('./string.js')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}

function encode (value, script, buf, offset) {
  assert(!buf || offset === 0, 'offset must be specified to overwrite buf')
  assert(value <= 0xffffffff, 'transaction value cannot exceed 64bits')
  assert(script, 'output script must be provided')

  if (!buf) buf = Buffer.alloc(encodingLength(script))
  if (!offset) offset = 0

  int.encode(value, buf, offset, 64)
  offset += 8
  string.encode(script, buf, offset)

  return buf
}

function decode (buf, offset) {
  var value = int.decode(buf, offset, 64, false)
  offset += int.decode.bytes

  var script = string.decode(buf, offset)

  return {
    value: value,
    script: script
  }
}

function encodingLength (script) {
  var length = Buffer.from(script).byteLength
  return length + 4
}

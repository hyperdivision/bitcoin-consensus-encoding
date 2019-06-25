var assert = require('nanoassert')
var int = require('./int.js')
var script = require('./script.js')

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
  script.encode(script, buf, offset)

  return buf
}

function decode (buf, offset) {
  var value = int.decode(buf, offset, 64, false)
  offset += int.decode.bytes

  var txScript = script.decode(buf, offset)

  return {
    value: value,
    script: txScript
  }
}

function encodingLength (script) {
  var length = script.encodingLength(script)
  return length + 8
}

const assert = require('nanoassert')
const int = require('./int.js')
const script = require('./script.js')
const varint = require('./var-int.js')

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
  const startIndex = offset

  int.encode(value, buf, offset, 64)
  offset += 8

  varint.encode(encodingLength(script).scriptLength, buf, offset)
  offset += varint.encode.bytes

  script.encode(script, buf, offset)
  offset += script.encode.bytes

  encode.bytes = offset - startIndex
  return buf
}

function decode (buf, offset) {
  if (!offset) offset = 0
  const startIndex = offset

  const value = buf.subarray(offset, offset + 8)
  offset += 8

  const scriptLength = varint.decode(buf, offset)
  offset += varint.decode.bytes

  const txScript = script.decode(buf.subarray(offset, offset + scriptLength))
  offset += scriptLength

  decode.bytes = offset - startIndex

  return {
    value: value,
    script: txScript
  }
}

function encodingLength (script) {
  let length = script.encodingLength(script)

  encodingLength.scriptLength = length

  length += varint.encodingLength(length)
  return length + 8
}

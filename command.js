var assert = require('nanoassert')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}

function encode (command, buf, offset) {
  assert(!buf || offset === 0, 'offset must be specified to overwrite buf')
  if (!buf) buf = Buffer.alloc(12)
  if (!offset) offset = 0

  if (!Buffer.isBuffer(command)) {
    assert(typeof command === 'string', 'invalid command')
    command = Buffer.from(command)
  }

  assert(command.byteLength <= 12, 'invalid command')
  var end = offset + command.byteLength
  buf.fill(command, offset, end)
  offset = end
  end += 12 - command.byteLength
  buf.fill(null, offset, end)

  command.encode.bytes = 12
  return buf
}

function decode (buf, offset) {
  var nullIndex = buf.indexOf(null, offset)
  nullIndex = nullIndex !== -1 ? nullIndex : 12

  var command = buf.subarray(offset, nullIndex)

  return command.toString()
}

function encodingLength () {
  return 12
}

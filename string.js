var assert = require('nanoassert')
var varint = require('./var-int.js')

module.exports = {
  encode,
  decode,
  encodingLength
}

function encode (string, buf, offset, bytes = false) {
  assert(!(buf && offset === undefined), 'offset must be specified to overwrite buf')
  if (!buf) buf = Buffer.alloc(encodingLength(string))
  if (!offset) offset = 0

  if (bytes) {
    string = Buffer.from(string, 'hex')
    buf.set(string, offset)
    encode.bytes = string.byteLength
    return buf
  }
  if (typeof string === 'string') {
    string = Buffer.from(string, 'utf8')
  } else {
    assert(Buffer.isBuffer(string))
  }

  varint.encode(string.byteLength, buf, offset)
  buf.set(string, offset + varint.encode.bytes)
  encode.bytes = varint.encode.bytes + string.byteLength
  return buf
}

function encodingLength (string, bytes = false) {
  if (bytes) {
    return Buffer.from(string, 'hex').byteLength
  } else {
    if (Buffer.isBuffer(string) === false) string = Buffer.from(string)
    return varint.encodingLength(string.byteLength) + string.byteLength
  }
}

function decode (buf, offset, bytes = false) {
  assert(Buffer.isBuffer(buf), 'buf must be an instance of Buffer')
  if (!offset) offset = 0
  if (!bytes) {
    var stringLength = varint.decode(buf, offset)
    var stringStart = offset + varint.decode.bytes
    decode.bytes = stringStart + stringLength - offset
    return buf.toString('utf8', stringStart, stringStart + stringLength)
  } else {
    decode.bytes = bytes
    return buf.toString('hex', offset, offset + bytes)
  }
}

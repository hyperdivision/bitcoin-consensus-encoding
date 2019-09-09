var assert = require('nanoassert')
var int = require('./int.js')

module.exports = {
  encode,
  decode,
  encodingLength
}

function encode (flag, value, buf, offset) {
  if (!buf) buf = Buffer.alloc(encodingLength(value))
  if (!offset) offset = 0
  const startIndex = offset

  let flagByte = 0x0
  if (flag) flagByte += 0x80

  if (value <= 0x7b) {
    buf.writeUInt8(value | flagByte, offset)
  }

  if (value > 0x7b && value <= 0xff) {
    buf.writeUInt8(0x7c | flagByte, offset)
    offset++

    buf.writeUInt8(value, offset)
    offset++
  }

  if (value > 0xff && value <= 0xffff) {
    buf.writeUInt8(0x7d | flagByte, offset) 
    offset++

    buf.writeUInt16LE(value, offset)
    offset += 2
  }

  if (value > 0xffff && value <= 0xffffffff) {
    buf.writeUInt8(0x7e | flagByte, offset)
    offset++

    buf.writeUInt32LE(value, offset)
    offset += 4
  }

  encode.bytes = offset - startIndex
  return buf  
}

function decode (buf, offset) {
  const result = {}

  const firstByte = buf.readUInt8(offset)
  offset++

  const flag = firstByte & 0x80
  const indicator = firstByte - flag

  result.flag = (flag == 0x80)
  result.value

  switch (indicator) {
    // 1 byte long
    case 0x7c :
      result.value = buf.readUInt8(offset)
      break

    // 2 bytes
    case 0x7d :
      result.value = buf.readUInt16LE(offset)
      break

    // 3 bytes
    case 0x7e :
      result.value = buf.readUInt32LE(offset)
      break

    // 4 bytes
    case 0x7f :
      break

    default : 
      result.value = indicator
      break
  }

  return result
}

function encodingLength (value) {
  if (value <= 0x7b) return 1
  if (value > 0x7b && value <= 0xff) return 2
  if (value > 0xff && value <= 0xffff) return 3
  if (value > 0xffff && value <= 0xffffffff) return 5
}
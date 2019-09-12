var assert = require('nanoassert')
var int = require('./int.js')

module.exports = {
  encode,
  decode,
  encodingLength
}

function encode (fvi, buf, offset) {
  if (!buf) buf = Buffer.alloc(encodingLength(fvi))
  if (!offset) offset = 0
  const startIndex = offset

  let flagByte = 0x0
  if (fvi.flag) flagByte += 0x80

  if (fvi.value <= 0x7b) {
    buf.writeUInt8(fvi.value | flagByte, offset)
    offset++
  }

  if (fvi.value > 0x7b && fvi.value <= 0xff) {
    buf.writeUInt8(0x7c | flagByte, offset)
    offset++

    buf.writeUInt8(fvi.value, offset)
    offset++
  }

  if (fvi.value > 0xff && fvi.value <= 0xffff) {
    buf.writeUInt8(0x7d | flagByte, offset) 
    offset++

    buf.writeUInt16LE(fvi.value, offset)
    offset += 2
  }

  if (fvi.value > 0xffff && fvi.value <= 0xffffffff) {
    buf.writeUInt8(0x7e | flagByte, offset)
    offset++

    buf.writeUInt32LE(fvi.value, offset)
    offset += 4
  }

  encode.bytes = offset - startIndex
  return buf  
}

function decode (buf, offset) {
  if (!offset) offset = 0
  const startIndex = offset
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
      result.value = 0x7f
      break

    default : 
      result.value = indicator
      break
  }

  decode.bytes = offset - startIndex
  return result
}

function encodingLength (fvi) {
  if (fvi.value <= 0x7b) return 1
  if (fvi.value > 0x7b && fvi.value <= 0xff) return 2
  if (fvi.value > 0xff && fvi.value <= 0xffff) return 3
  if (fvi.value > 0xffff && fvi.value <= 0xffffffff) return 5
  throw new Error('input value can be at most 32 bits long')
}

console.log(decode(Buffer.from([0x7f])))

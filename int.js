var assert = require('nanoassert')

module.exports = {
  encode,
  decode,
  encodingLength
}

function encodingLength (number) {
  assert(number || number === 0, 'input required.')
  if (typeof number !== 'number') {
    if (number <= BigInt('0x7fffffffffffffff')) {
      if (number >= -BigInt('0x8000000000000000')) return 8
    }
    throw new Error('Out of range')
  }
  if (number >= -0x80 && number <= 0x7f) return 1
  if (number >= -0x8000 && number <= 0x7fff) return 2
  if (number >= -0x80000000 && number <= 0x7fffffff) return 4
  throw new Error('invalid input')
}

function encode (number, buf, offset, bits) {
  var validBits = [8, 16, 32, 64]
  if (!bits) bits = encodingLength(number) * 8
  if (!buf) buf = Buffer.alloc(bits / 8)
  if (!offset) offset = 0

  assert(validBits.includes(bits), 'TODO valid size')
  assert((buf.byteLength - offset) * 8 >= bits, 'TODO enough space')

  switch (bits) {
    case 8:
      buf.writeInt8(number, offset)
      break

    case 16:
      buf.writeInt16BE(number, offset)
      break

    case 32:
      buf.writeInt32BE(number, offset)
      break

    case 64:
      writeBigInt64BE(buf, number, offset)
      break
  }

  encode.bytes = bits / 8
  return buf
}

function decode (buf, offset, byteLength, unsigned = true) {
  assert(!(buf && offset === 0), 'offset must be specified to overwrite buf')
  assert(Buffer.isBuffer(buf), 'buf must be an instance of Buffer')
  if (!offset) offset = 0
  if (!byteLength) {
    byteLength = buf.byteLength - offset
  }
  assert(byteLength <= 8, 'input buffer must be at most 8 bytes')

  decode.bytes = byteLength
  switch (byteLength) {
    case 8 : {
      return readBigInt64BE(buf, offset)
    }

    case 4 : {
      return buf.readInt32BE(offset)
    }

    case 2 : {
      return buf.readInt16BE(offset)
    }

    case 1 : {
      return buf.readInt8(offset)
    }
  }
}

// utilities taken from https://github.com/nodejs/node/blob/d3b10f66bd4943f7da9aa25415ea6900d7f48086/lib/internal/buffer.js
function writeBigInt64BE (buf, value, offset) {
  value = BigInt(value)
  assert(-BigInt('0x8000000000000000') <= value && value <= BigInt('0x7fffffffffffffff'), 'TODO out of range')

  let lo = Number(value & BigInt(0xffffffff))
  buf[offset + 7] = lo
  lo = lo >> 8
  buf[offset + 6] = lo
  lo = lo >> 8
  buf[offset + 5] = lo
  lo = lo >> 8
  buf[offset + 4] = lo
  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
  buf[offset + 3] = hi
  hi = hi >> 8
  buf[offset + 2] = hi
  hi = hi >> 8
  buf[offset + 1] = hi
  hi = hi >> 8
  buf[offset] = hi
  return offset + 8
}

function readBigInt64BE (buf, offset = 0) {
  const first = buf[offset]
  const last = buf[offset + 7]
  assert(!(first === undefined || last === undefined), 'TODO out of bounds')

  const val = (first << 24) + // Overflow
    buf[++offset] * 2 ** 16 +
    buf[++offset] * 2 ** 8 +
    buf[++offset]
  return (BigInt(val) << BigInt('32')) +
    BigInt(buf[++offset] * 2 ** 24 +
    buf[++offset] * 2 ** 16 +
    buf[++offset] * 2 ** 8 +
    last)
}

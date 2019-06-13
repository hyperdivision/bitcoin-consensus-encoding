var assert = require('nanoassert')
var bigUIntLE = require('biguintle')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}

function encode (number, buf, offset, bits) {
  var validBits = [8, 16, 32, 64]
  assert(validBits.includes(bits), 'bit length not supported')
  var stringLength = number.toString(2).length
  var bitLength = number < 0 ? stringLength : stringLength - 1
  assert(bitLength < bits, 'too few bits provided')
  var encodingLength = encodingLength(bits)

  if (!buf) buf = Buffer.alloc(encodingLength)
  if (!offset) offset = 0

  switch (bits) {
    case 64 : {
      assert(typeof number === 'bigint', '64-bit input must be instance of BigInt')
      number = number > 0 ? number : number + 2n ** 64n
      bigUIntLE.encode(number, buf, offset)
      break
    }

    case 32 : {
      buf.writeInt32LE(number)
      break
    }

    case 16 : {
      buf.writeInt16LE(number)
      break
    }

    case 8 : {
      buf.writeInt8(number)
      break
    }
  }

  encode.bytes = encodingLength
  return buf
}

function encodingLength (bits) {
  return (bits / 8)
}

function decode (buf, offset, byteLength) {
  assert(Buffer.isBuffer(buf), 'buf must be an instance of Buffer')
  if (!offset) offset = 0
  if (!byteLength) byteLength = buf.byteLength - offset
  assert(byteLength <= 8, 'input buffer must be at most 8 bytes')
  switch (byteLength) {
    case 8 : {
      var low = BigInt(buf.readUInt32LE())
      var high = BigInt(buf.readUInt32LE(4)) * 256n ** 4n

      var result = high + low
      return result < 2n ** 64n ? result : result - 2n ** 64n
    }

    case 4 : {
      return buf.readInt32LE()
    }

    case 2 : {
      return buf.readInt16LE()
    }

    case 1 : {
      return buf.readInt8()
    }
  }
}

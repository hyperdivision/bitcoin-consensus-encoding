var assert = require('nanoassert')
var bigUIntLE = require('biguintle')

function encode (number, buf, offset, bits) {
  var validBits = [8, 16, 32, 64]
  assert(validBits.includes(bits), 'bit length not supported')
  var stringLength = number.toString(2).length
  var bitLength = number < 0 ? stringLength : stringLength - 1
  assert(bitLength < bits, 'too few bits provided')

  if (!buf) buf = Buffer.alloc(encodingLength(bits))
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

  encode.bytes = (bits / 8)
  return buf
}

function encodingLength (bits) {
  return (bits / 8)
}

function decode (buf, offset) {
  assert(Buffer.isBuffer(buf), 'buf must be an instance of Buffer')
  console.log(buf.byteLength)
  switch (buf.byteLength) {
    case 8 : {
      var low = BigInt(buf.readUInt32LE())
      var high = BigInt(buf.readUInt32LE(4)) * 256n ** 4n

      var result = high + low
      return result < 2n ** 6n ? result : result - 2n ** 64n
    }

    case 4 : {
      return buf.readUInt32LE()
    }

    case 2 : {
      return buf.readUInt16LE()
    }

    case 1 : {
      return buf.readUInt8()
    }
  }
}

var test = encode(-(2n ** 61n + 760n), null, null, 64)
console.log(test)
console.log(decode(test))
console.log(-(2n ** 61n + 760n))
// console.log(decode(test))
// console.log(decode(test) + (2 ** 61 + 760))

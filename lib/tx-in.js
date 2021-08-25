const varint = require('./var-int.js')
const script = require('./script.js')

module.exports = {
  encode,
  decode
}

function encode () {
  throw new Error('method does not exist')
}

function decode (buf, offset) {
  if (!offset) offset = 0
  const startIndex = offset

  const txIn = {}

  txIn.prevOutput = {
    txid: buf.subarray(offset, offset + 32),
    vout: buf.readUInt32LE(offset + 32)
  }
  offset += 36

  const scriptBytes = varint.decode(buf, offset)
  offset += varint.decode.bytes

  txIn.script = buf.subarray(offset, offset + scriptBytes).toString('hex')
  offset += scriptBytes

  txIn.sequence = buf.readUInt32LE(offset)
  offset += 4

  decode.bytes = offset - startIndex
  return txIn
}

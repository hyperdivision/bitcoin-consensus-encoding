const txout = require('./tx-out.js')
const txInDecode = require('./tx-in.js')
const witnessDecode = require('./witness.js')
const varint = require('./var-int.js')

module.exports = decode

function decode (buf, offset) {
  if (!offset) offset = 0
  const startIndex = offset
  const tx = {}
  let segwit = false

  tx.version = buf.readInt32LE(offset)
  offset += 4

  if (buf.readUInt8(offset) === 0) {
    offset++
    if (buf.readUInt8(offset) !== 1) {
      throw new Error('segwit flag must be set to 0001')
    }
    segwit = true
    offset++
  }

  const txInCount = varint.decode(buf, offset)
  offset += varint.decode.bytes

  tx.txIn = []

  for (let i = 0; i < txInCount; i++) {
    const txIn = txInDecode(buf, offset)
    offset += txInDecode.bytes

    tx.txIn.push(txIn)
  }

  const txOutCount = varint.decode(buf, offset)
  offset += varint.decode.bytes

  tx.txOut = []

  for (let i = 0; i < txOutCount; i++) {
    const txOut = txout.decode(buf, offset)
    offset += txout.decode.bytes

    tx.txOut.push(txOut)
  }

  if (segwit) {
    for (let txIn of tx.txIn) {
      txIn.witness = witnessDecode(txInCount, buf, offset)
      offset += witnessDecode.bytes
    }
  }

  tx.locktime = buf.readUInt32LE(offset)
  offset += 4

  decode.bytes = offset - startIndex
  return tx
}

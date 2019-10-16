const varint = require('./var-int.js')
const fs = require('fs')
const reverse = require('buffer-reverse')
const transactionDecode = require('./tx.js')

module.exports = {
  encode,
  decode
}

function encode () {
  throw new Error('method does not exist')
}

function decode (buf, offset) {
  if (!offset) offset = 0
  const block = {}
  const startIndex = offset

  block.version = buf.readInt32LE(offset)
  offset += 4

  block.prevBlockHash = reverse(buf.subarray(offset, offset + 32)).toString('hex')
  offset += 32

  block.merkleRootHash = reverse(buf.subarray(offset, offset + 32)).toString('hex')
  offset += 32

  block.time = buf.readUInt32LE(offset)
  offset += 4

  block.nBits = buf.readUInt32LE(offset)
  offset += 4

  block.nonce = buf.readUInt32LE(offset)
  offset += 4

  block.txnCount = varint.decode(buf, offset)
  offset += varint.decode.bytes

  block.tx = []

  for (let i = 0; i < block.txnCount; i++) {
    const tx = transactionDecode(buf, offset)
    offset += transactionDecode.bytes
    
    block.tx.push(tx)
  }

  decode.bytes = offset - startIndex
  return block
}

const varint = require('./var-int.js')
const script = require('./script.js')

module.exports = {
  encode,
  decode
}

function encode () {
  throw new Error('method does not exist')
}

function decode (number, buf, offset) {
  if (!offset) offset = 0
  const startIndex = offset

  const witnessStack = []

  const witnessStackItems = varint.decode(buf, offset)
  offset += varint.decode.bytes

  for (let i = 0; i < witnessStackItems; i++) {
    const witnessLength = varint.decode(buf, offset)
    offset += varint.decode.bytes

    if (witnessLength === 0) {
      witnessStack.push('0')
      continue
    }

    const witness = buf.subarray(offset, offset + witnessLength).toString('hex')
    offset += witnessLength

    witnessStack.push(witness)
  }

  decode.bytes = offset - startIndex
  return witnessStack
}

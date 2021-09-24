const int = require('./int')
const varint = require('./var-int')
const crypto = require('crypto')

module.exports = function (tx, script, value, vout, sighashType, buf, offset) {
  if (!buf) buf = Buffer.alloc(encodingLength(tx, script, sighashType))
  if (!offset) offset = 0
  const startIndex = offset

  buf.writeUInt32LE(tx.version, offset)
  offset += 4

  const prevouts = hashPrevouts(tx.in)
  buf.set(prevouts, offset)
  offset += prevouts.byteLength

  const sequence = hashSequence(tx.in)
  buf.set(sequence, offset)
  offset += sequence.byteLength

  buf.set(tx.in[vout].txid, offset)
  offset += tx.in[vout].txid.byteLength

  buf.writeUInt32LE(vout, offset)
  offset += 4

  // scriptCode
  varint.encode(script.byteLength, buf, offset)
  offset += varint.encode.bytes

  buf.set(script, offset)
  offset += script.byteLength

  int.encode(value, buf, offset, 64)
  offset += int.encode.bytes

  if (Buffer.isBuffer(tx.in[vout].sequence)) {
    for (let i = 3; i >= 0; i--) buf[offset++] = tx.in[vout].sequence[i]
  } else {
    buf.writeUInt32LE(tx.in[vout].sequence, offset)
    offset += 4
  }

  const outputs = hashOutputs(tx.out)
  buf.set(outputs, offset)
  offset += outputs.byteLength

  if (Buffer.isBuffer(tx.locktime)) {
    for (let i = 3; i >= 0; i--) buf[offset++] = tx.locktime[i]
  } else {
    buf.writeUInt32LE(tx.locktime, offset)
    offset += 4
  }

  buf.writeUInt32LE(sighashType, offset)
  offset += 4

  return buf
}

function encodingLength (tx, script, sighashType) {
  console.log(script.byteLength)
  return 157 + script.byteLength
}

function hashPrevouts (inputs) {
  const buf = Buffer.alloc(36 * inputs.length)
  let offset = 0

  for (const input of inputs) {
    buf.set(input.txid, offset)
    buf.writeUInt32LE(input.vout, offset + 32)
    offset += 36
  }

  return dSha(buf)
}

function hashSequence (inputs) {
  const buf = Buffer.alloc(4 * inputs.length)
  let offset = 0

  for (const input of inputs) {
    if (Buffer.isBuffer(input.sequence)) {
      buf.set(reverse(input.sequence), offset)
      offset += input.sequence.byteLength
    } else {
      buf.writeUInt32LE(input.sequence, offset)
      offset += 4
    }
  }

  return dSha(buf)
}

function hashOutputs (outputs) {
  const buf = Buffer.alloc(8 * outputs.length + 1 + outputs.reduce((acc, o) => acc + o.script.byteLength, 0))
  let offset = 0

  for (const output of outputs) {
    int.encode(output.value, buf, offset, 64)
    offset += int.encode.bytes

    varint.encode(output.script.byteLength, buf, offset)
    offset += varint.encode.bytes

    buf.set(output.script, offset)
    offset += output.script.byteLength - 1
  }

  return dSha(buf)
}

function shasum (data) {
  return crypto.createHash('sha256').update(data).digest()
}

function dSha (data) {
  return shasum(shasum(data))
}

function reverse (buf) {
  const ret = Buffer.alloc(buf.byteLength)
  for (let i = 0; i < buf.byteLength; i++) {
    ret[i] = buf[buf.byteLength - 1 - i]
  }

  return ret
}

module.exports = {
  encode,
  decode,
  encodingLength
}

function encode (pubkey, buf, offset) {
  if (!Buffer.isBuffer(pubkey)) {
    pubkey = Buffer.from(pubkey, 'hex')
  }
  if (!buf) buf = Buffer.alloc(encodingLength(pubkey))
  if (!offset) offset = 0
  const startIndex = offset

  buf.set(pubkey, offset)
  offset += pubkey.byteLength

  encode.bytes = offset - startIndex
  return buf
}

function decode (buf, offset) {
  if (!offset) offset = 0

  const pubkey = {}

  pubkey.type = buf.readUInt8(offset)
  offset++

  pubkey.compressed = true
  pubkey.x = buf.subarray(offset, offset + 32)
  offset += 32

  if (pubkey.type === 0x02) {
    pubkey.even = true
  } else if (pubkey.type === 0x03) {
    pubkey.even = false
  } else if (pubkey.type === 0x04) {
    pubkey.compressed = false
  
    pubkey.y = buf.subarray(offset, offset + 32)
    offset += 32
  } else {
    throw new Error('unrecognised key type')
  }

  pubkey.raw = buf.subarray(startIndex, offset)

  decode.bytes = offset - startIndex
  return pubkey
}

function encodingLength (pubkey) {
  return Buffer.from(pubkey, 'hex').byteLength
}

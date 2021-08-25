const assert = require('nanoassert')
const int = require('./int.js')
const OPS = require('./opcodes.json')

module.exports = {
  encode,
  decode,
  encodingLength
}

const map = {}

// make reverse map for decoding
for (const op in OPS) {
  if (op === 'OP_PUSHDATA') {
    break
  }
  const code = OPS[op]
  map[code] = op
}

function encode (script, buf, offset) {
  assert(typeof script === 'string' || Buffer.isBuffer(script),
    'script must be input as string or buffer')
  assert(!buf || offset === 0,
    'offset must be specified to overwrite buf')
  if (Buffer.isBuffer(script)) script = script.toString('utf8')
  if (!buf) buf = Buffer.alloc(encodingLength(script))
  if (!offset) offset = 0
  const startIndex = offset

  if (typeof script === 'string') {
    var scriptArray = script.split(' ')
  }

  for (let entry of scriptArray) {
    if (entry.substring(0, 3) === 'OP_') {
      entry = entry.substring(3)
    }
    // replace OP strings with hex code
    if (OPS.hasOwnProperty('OP_' + entry)) {
      entry = 'OP_' + entry
      buf.writeUInt8(OPS[entry], offset)
      offset++
    } else {
      entry = format(entry)
      buf.set(entry, offset)
      offset += format.bytes
    }
  }

  encode.bytes = offset - startIndex
  return buf
}

function decode (buf, offset) {
  if (!offset) offset = 0
  const startIndex = offset

  let script = ''
  const pushDataOps = [0x4c, 0x4d, 0x4e]

  // handle OP_RETURN
  if (buf.readUInt8(0) === 0x6a) {
    const result = map[0x6a] + ' ' + buf.toString('hex', 1)
    decode.bytes = result.byteLength
    return result
  }

  while (offset < buf.byteLength) {
    const byte = buf.readUInt8(offset)
    offset++

    if (pushDataOps.includes(byte) || !(map.hasOwnProperty(byte))) {
      const data = pushData(byte, buf.subarray(offset))

      script += data.toString('hex') + ' '
      offset += pushData.bytes
    } else {
      script += map[byte] + ' '
    }
  }

  decode.bytes = offset - startIndex
  return script.trim(' ')
}

function encodingLength (script) {
  let length = 0
  const scriptArray = script.split(' ')

  for (let entry of scriptArray) {
    if (entry.substring(0, 3) === 'OP_') {
      entry = entry.substring(3)
    }
    if (OPS.hasOwnProperty('OP_' + entry)) {
      length++
    } else {
      entry = format(entry)
      length += format.bytes
    }
  }
  return length
}

// encoding format raw data to be put onto stack as bytes
function format (entry) {
  format.bytes = 0
  entry = Buffer.from(entry, 'utf8')
  const prefix = prefixLength(entry)
  const entryLength = prefixLength.bytes + entry.byteLength
  format.bytes += entryLength

  const writeBuf = Buffer.alloc(entryLength)

  writeBuf.set(prefix)
  writeBuf.set(entry, prefixLength.bytes)

  return writeBuf
}

// prefix data to be put onto stack with length field
function prefixLength (entry) {
  const length = int.encode(entry.byteLength)
  let prefix = new Uint8Array(1)

  switch (true) {
    case (int.encode.bytes === 1 && length > 0xfb) : {
      prefix[0] = 0x4c
      break
    }

    case (int.encode.bytes === 1) : {
      prefixLength.bytes = 1
      return length
    }

    case (int.encode.bytes === 2) : {
      prefix[0] = 0x4d
      break
    }

    case (int.encode.bytes === 4) : {
      prefix[0] = 0x4e
      break
    }
  }
  prefixLength.bytes = 1 + int.encode.bytes
  prefix = Buffer.concat([prefix, length])
  return prefix
}

// read raw data from stack according to OP_PUSHDATA codes
function pushData (byte, buf) {
  let length, start
  switch (true) {
    case (byte < 76) : {
      start = 0
      length = byte
      break
    }

    case byte === 76 : {
      start = 1
      length = buf.readUInt8()
      break
    }

    case byte === 77 : {
      start = 2
      length = buf.readUInt16LE()
      break
    }

    case byte === 78 : {
      start = 4
      length = buf.readUInt32LE()
      break
    }
  }

  const end = start + length
  pushData.bytes = end
  return buf.subarray(start, end)
}

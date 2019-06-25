var assert = require('nanoassert')
var int = require('./int.js')
var OPS = require('./opcodes.json')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}

var map = {}

for (var op in OPS) {
  if (op === 'OP_PUSHDATA') {
    break
  }

  var code = OPS[op]
  map[code] = op
}

function encode (script, buf, offset) {
  assert(typeof script === 'string' || Buffer.isBuffer(script),
    'script must be input as string or buffer')
  assert(!buf || offset === 0,
    'offset must be specified to overwrite buf')
  if (!buf) buf = Buffer.alloc(encodingLength(script))
  if (!offset) offset = 0

  if (typeof script === 'string') {
    var scriptArray = script.split(' ')
  }
  for (var entry of scriptArray) {
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
  return buf
}

function format (entry) {
  format.bytes = 0
  entry = Buffer.from(entry, 'utf8')
  // entry must be <76 bytes or else OP_PUSHDATA required
  var prefix = prefixLength(entry)
  var entryLength = prefixLength.bytes + entry.byteLength
  format.bytes += entryLength

  var writeBuf = Buffer.alloc(entryLength)

  writeBuf.set(prefix)
  writeBuf.set(entry, prefixLength.bytes)

  return writeBuf
}

function decode (buf, offset) {
  if (!offset) offset = 0
  var script = ''
  var pushDataOps = [0x4c, 0x4d, 0x4e]

  while (offset < buf.byteLength) {
    var byte = buf.readUInt8(offset)
    offset++

    if (pushDataOps.includes(byte) || !(map.hasOwnProperty(byte))) {
      var data = pushData(byte, buf.subarray(offset))
      script += data.toString('utf8') + '\n'
      offset += pushData.bytes
    } else {
      script += map[byte] + '\n'
    }
  }
  return script
}

function encodingLength (script) {
  var length = 0
  var scriptArray = script.split(' ')

  for (var entry of scriptArray) {
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

function prefixLength (entry) {
  var length = int.encode(entry.byteLength)
  var prefix = new Uint8Array(1)

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

function pushData (byte, buf) {
  var length, start
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
  var end = start + length
  pushData.bytes = end
  return buf.subarray(start, end)
}

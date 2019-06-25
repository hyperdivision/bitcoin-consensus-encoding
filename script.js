var assert = require('nanoassert')
var int = require('./int.js')
var OPS = require('./opcodes.json')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}

var map = {}

for (var op of OPS) {
  if (op.contains('OP_PUSHDATA')) {
    break
  }

  var code = OPS[op]
  map[code] = op
}

function encode (script, buf, offset) {
  assert(!buf || offset === 0, 'offset must be specified to overwrite buf')
  if (!buf) buf = Buffer.alloc(encodingLength(script))
  if (!offset) offset = 0

  if (typeof script === 'string') {
    var scriptArray = script.split('')
  }

  for (var entry of scriptArray) {
    if (entry.substring(0, 3) === 'OP_') {
      entry = entry.substring(3)
    }

    // replace OP strings with hex code
    if (OPS.includes('OP_' + entry)) {
      buf.readUInt8(OPS[parseInt(entry)])
      offset++
      break
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
  entry = Buffer.from(entry, 'hex')

  var prefix = prefixLength(entry)

  var prefixBytes = prefix ? 1 : 0
  var entryLength = prefixBytes + entry.byteLength
  format.bytes += entryLength

  writeBuf = Buffer.alloc(entryLength)

  if (prefix) writeBuf.writeUInt8(prefix)
  writeBuf.set(entry, prefixbytes)

  return writeBuf
}

function decode (buf, offset) {
  var script

  while (offset < buf.byteLength) {
    var byte = buf.readUInt8(offset)
    offset++

    if (map.hasOwnProperty(byte)) {
      script += map[byte] + '\n'
      offset++
    } else {
      var data = pushData(byte, buf.subarray(offset))
      script += data.toString('hex') + '\n'
      offset += pushData.bytes
    }
  }
  return script
}

function encodingLength (script) {
  length = 0
  var scriptArray = script.split('')

  for (var entry of scriptArray) {
    if (entry.substring(0, 3) === 'OP_') {
      entry = entry.substring(3)
    }

    if (OPS.includes('OP_' + entry)) {
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
  var prefix

  switch (true) {
    case (int.encode.bytes === 1 && length > 0xfb) : {
      prefix = 0x4c
      break
    }

    case (int.encode.bytes === 1) : {
      prefix.bytes = 0
      return
    }

    case (int.encode.bytes === 2) : {
      prefix = 0x4d
      break
    }

    case (int.encode.bytes === 4) : {
      prefix = 0x4e
      break
    }
  }
  return prefix
}

function pushData (byte, buf) {
  var length, start

  switch (byte) {
    case 76 : {
      start = 1
      length = buf.readUInt8()
      break
    }

    case 77 : {
      start = 2
      length = buf.readUInt16LE()
      break
    }

    case 78 : {
      start = 4
      length = buf.readUInt32LE()
      break
    }
  }

  var end = start + length
  pushData.bytes = end
  return buf.subarray(start, end)
}

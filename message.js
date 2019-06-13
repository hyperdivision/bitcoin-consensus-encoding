var assert = require('nanoassert')
var sodium = require('sodium-native')
var varint = require('./var-int.js')
var int = require('./int.js')
var uint = require('./uint.js')
var string = require('./string.js')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}
var knownCommands = [
]

var magicValues = {
  'main': 0xD9B4BEF9,
  'testnet': 0xDAB5BFFA,
  'testnet3': 0x0709110B,
  'namecoin': 0xFEB4BEF9
}

function encode (payload, command, network, buf, offset) {
  if (!Buffer.isBuffer(payload)) {
    assert(typeof payload === 'string', 'payload must be sequence of characters')
    payload = Buffer.from(payload)
  }
  if (!Buffer.isBuffer(command)) {
    assert(typeof command === 'string', 'invalid command')
    command = Buffer.from(command)
  }
  if (!offset) offset = 0
  if (!buf) buf = Buffer.alloc(encodingLength(payload))

  assert(magicValues.keys.includes(network))
  var magic = int.encode(magicValues[network], null, null, 32)

  assert(command.byteLength <= 12, 'invalid command')
  var commandBuf = Buffer.alloc(12, command)
  commandBuf.fill(null, command.byteLength)

  var length = int.encode(payload.byteLength, null, null, 32)
  var doubleSHA = Buffer.alloc(sodium.crypto_hash_sha256_BYTES)
  sodium.crypto_hash_sha256(payload, doubleSHA)
  sodium.crypto_hash_sha256(doubleSHA, doubleSHA)

  var checkSum = Buffer.alloc(4, doubleSHA)

  var outBuf = Buffer.alloc(encodingLength(payload))

  outBuf.set(magic, 0)
  outBuf.set(commandBuf, 4)
  outBuf.set(length, 16)
  outBuf.set(checkSum, 20)
  outBuf.set(payload, 24)

  return outBuf
}

function decode (buf, offset) {
  if (!offset) offset = 0
  var magic = int.decode(buf, offset, 4)
  var network = getKeyByValue(magicValues, magic)
  offset += 4

  var nullIndex = buf.subarray(offset).indexOf(null)
  assert(nullIndex - offset <= 12, 'invalid format')

  var command = buf.subarray(offset, nullIndex).toString()
  offset += 12

  var length = int.decode(buf, offset, 4)
  offset += 4

  var checkSum = int.decode(buf, offset, 4)
  offset += 4

  var payload = buf.subarray(offset)

  var checkedSum = Buffer.alloc(sodium.crypto_hash_sha256_BYTES)
  sodium.crypto_hash_sha256(payload, checkedSum)
  sodium.crypto_hash_sha256(checkedSum, checkedSum)

  assert(Buffer.compare(checkSum, checkedSum) === 0, 'invalid checksum')
  payload = payload.toString()

  return {
    network: network,
    command: command,
    length: length,
    checkSum: checkSum,
    payload: payload
  }
}

function encodingLength (payload) {
  return payload.byteLength + 24
}

function getKeyByValue (object, value) {
  return Object.keys(object).find(key => object[key] === value)
}

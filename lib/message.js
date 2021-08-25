var assert = require('nanoassert')
var int = require('./int.js')
var command = require('./command.js')
const sha256 = require('sha256-wasm')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}

var magicValues = {
  'main': 0xD9B4BEF9,
  'testnet': 0xDAB5BFFA,
  'testnet3': 0x0709110B,
  'namecoin': 0xFEB4BEF9
}

function encode (payload, inputCommand, network, buf, offset) {
  assert(!buf || offset === 0, 'offset must be specified to overwrite buf')
  if (!Buffer.isBuffer(payload)) {
    assert(typeof payload === 'string', 'payload must be sequence of characters')
    payload = Buffer.from(payload)
  }

  if (!offset) offset = 0
  if (!buf) buf = Buffer.alloc(encodingLength(payload))

  assert(magicValues.keys.includes(network))
  int.encode(magicValues[network], buf, offset, 32)
  offset += int.encode.bytes

  command.encode(inputCommand, buf, offset)
  offset += command.encode.bytes

  int.encode(payload.byteLength, buf, offset, 32)
  offset += int.encode.bytes

  var doubleSHA = Buffer.alloc(32)
  payload = Buffer.from(sha256().update(doubleSHA).digest())
  doubleSHA = Buffer.from(sha256().update(doubleSHA).digest())

  buf.set(doubleSHA.subarry(0, 4), offset)
  buf.set(payload, 24)

  return buf
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

  var checkedSum = Buffer.alloc(32)
  payload = Buffer.from(sha256().update(checkedSum).digest())
  checkedSum = Buffer.from(sha256().update(checkedSum).digest())

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
  if (!Buffer.isBuffer(payload)) payload = Buffer.from(payload)
  return payload.byteLength + 24
}

function getKeyByValue (object, value) {
  return Object.keys(object).find(key => object[key] === value)
}

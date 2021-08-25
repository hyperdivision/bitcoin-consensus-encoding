const assert = require('nanoassert')
const int = require('./int.js')
const command = require('./command.js')
const sha256 = require('sha256-wasm')

module.exports = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength
}

const magicValues = {
  main: 0xD9B4BEF9,
  testnet: 0xDAB5BFFA,
  testnet3: 0x0709110B,
  namecoin: 0xFEB4BEF9
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

  const doubleSHA = Buffer.alloc(32)
  sha(doubleSHA, payload)
  sha(doubleSHA, doubleSHA)

  buf.set(doubleSHA.subarry(0, 4), offset)
  buf.set(payload, 24)

  return buf
}

function decode (buf, offset) {
  if (!offset) offset = 0
  const magic = int.decode(buf, offset, 4)
  const network = getKeyByValue(magicValues, magic)
  offset += 4

  const nullIndex = buf.subarray(offset).indexOf(null)
  assert(nullIndex - offset <= 12, 'invalid format')

  const command = buf.subarray(offset, nullIndex).toString()
  offset += 12

  const length = int.decode(buf, offset, 4)
  offset += 4

  const checkSum = int.decode(buf, offset, 4)
  offset += 4

  let payload = buf.subarray(offset)

  const checkedSum = Buffer.alloc(32)
  sha(checkedSum, payload)
  sha(checkedSum, checkedSum)

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

function sha (output, input) {
  return sha256().update(input).digest(output)
}

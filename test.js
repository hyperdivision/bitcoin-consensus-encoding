const test = require('tape')
var varint = require('./var-int.js')
var int = require('./int.js')
var string = require('./string.js')
// var bool = require('./boolean.js')
var script = require('./script.js')
var fs = require('fs')

var exampleScript = fs.readFileSync('./example.script')
var encodedScript = Buffer.from('76a90c3c7075626b6579686173683e88ac', 'hex')

test('varint encode', function (assert) {
  assert.throws(() => varint.encode(null))
  assert.ok(varint.encode.bytes == null)
  assert.throws(() => varint.encode(false))
  assert.ok(varint.encode.bytes == null)
  assert.throws(() => varint.encode(true))
  assert.ok(varint.encode.bytes == null)

  // tests from https://docs.rs/bitcoin/0.18.0/src/bitcoin/consensus/encode.rs.html#15-893
  assert.same(varint.encode(10), Buffer.from([10]))
  assert.same(varint.encode.bytes, 1)
  assert.same(varint.encode(0xfc), Buffer.from([0xfc]))
  assert.same(varint.encode.bytes, 1)
  assert.same(varint.encode(0xfd), Buffer.from([0xfd, 0, 0xfd]))
  assert.same(varint.encode.bytes, 3)
  assert.same(varint.encode(0xf0f0f0f), Buffer.from([0xfe, 0xf, 0xf, 0xf, 0xf]))
  assert.same(varint.encode.bytes, 5)
  assert.same(varint.encode(BigInt('0xF0F0F0F0F0E0')), Buffer.from([0xFF, 0, 0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xE0]))
  assert.same(varint.encode.bytes, 9)

  assert.same(varint.encode(BigInt('0xF0F0F0F0F0E0'), Buffer.alloc(9), 0), Buffer.from([0xFF, 0, 0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xE0]))
  assert.same(varint.encode.bytes, 9)
  assert.end()
})

test('varint decode', function (assert) {
  assert.throws(() => varint.decode(null))
  assert.ok(varint.decode.bytes == null)
  assert.throws(() => varint.decode(false))
  assert.ok(varint.decode.bytes == null)
  assert.throws(() => varint.decode(true))
  assert.ok(varint.decode.bytes == null) // fail

  assert.throws(() => varint.decode(true))
  assert.ok(varint.decode.bytes == null) // fail

  // tests from https://docs.rs/bitcoin/0.18.0/src/bitcoin/consensus/encode.rs.html#15-893
  assert.end()
})

test('string encode', function (assert) {
  assert.throws(() => string.encode(null))
  assert.ok(string.encode.bytes == null)
  assert.throws(() => string.encode(false))
  assert.ok(string.encode.bytes == null)
  // assert.throws(() => string) // fail
  assert.ok(string.encode.bytes == null)

  assert.same(string.encode('Andrew'.toString()), Buffer.from([0x06, 0x41, 0x6e, 0x64, 0x72, 0x65, 0x77]))
  assert.end()
})

test('string decode', function (assert) {
  assert.throws(() => string.decode(null))
  assert.ok(string.decode.bytes == null)
  assert.throws(() => string.decode(false))
  assert.ok(string.decode.bytes == null)
  // assert.throws(() => string) // should throw
  assert.ok(string.decode.bytes == null)
  assert.end()
})

test('script encode', function (assert) {
  assert.throws(() => script.encode(null))
  assert.ok(script.encode.bytes == null)
  assert.throws(() => script.encode(false))
  assert.ok(script.encode.bytes == null)
  // assert.throws(() => script)
  assert.ok(script.encode.bytes == null)

  assert.deepEqual(script.encode(exampleScript), encodedScript)
  assert.end()
})

test('script decode', function (assert) {
  assert.throws(() => script.decode(null))
  assert.ok(script.decode.bytes == null)
  assert.throws(() => script.decode(false))
  assert.ok(script.decode.bytes == null)
  // assert.throws(() => script)
  assert.ok(script.decode.bytes == null)

  assert.equal(script.decode(encodedScript), exampleScript.toString('utf8'))
  assert.end()
})

test('int', function (assert) {
  assert.equal(int.decode(int.encode(0)), 0)
  assert.throws(() => int.encode(null))
  assert.throws(() => int.encode(false))
  assert.equal(int.decode(int.encode(-1)), -1)
  assert.equal(int.decode(int.encode(BigInt('0x7fffffffffffffff'))), BigInt('0x7fffffffffffffff'))
  assert.equal(int.decode(int.encode(-BigInt('0x7fffffffffffffff'))), -BigInt('0x7fffffffffffffff'))
  assert.throws(() => int.encode(BigInt('0x8000000000000000')))
  assert.equal(int.encode(2 ** 31 - 1).byteLength, 4)
  assert.equal(int.decode(Buffer.from('80', 'hex'), null, 1), -(2 ** 7))
  assert.equal(int.decode(Buffer.from('8000', 'hex'), null, 2), -(2 ** 15))
  assert.equal(int.decode(Buffer.from('80000000', 'hex'), null, 4), -(2 ** 31))
  assert.equal(int.decode(Buffer.from('8000000000000000', 'hex'), null, 8), -BigInt('0x8000000000000000'))
  assert.end()
})

// test('tx-out encode', function (assert) {

// var exampleScript = fs.readFileSync('./contract.script').toString()
// var encoded = encode(exampleScript)
// console.log(encoded.toString('hex'))
// var decoded = decode(encoded)
// console.log(decoded)
// // varint.decode
// try {
//   console.log(varint.decode(Buffer.from(null)))
// } catch (err) { console.log(err.code) }
// try {
//   console.log(varint.decode(Buffer.from('fa', 'hex')))
// } catch (err) { console.log(err.code) }
// try {
//   console.log(varint.decode(Buffer.from('fefafed2aa', 'hex')))
// } catch (err) { console.log(err.code) }
// try {
//   console.log(varint.decode(Buffer.from('fffafed2aafffdadff', 'hex')))
// } catch (err) { console.log(err.code) }

// // string.encode
// try {
//   console.log(stringer.encode('where are you?'))
// } catch (err) { console.log(err.code) }
// try {
//    var data = fs.readFileSync('./var-int.js')
//   console.log(stringer.encode(data.toString()))
// } catch (err) { console.log(err.code) }

// // string.decode
// try {
//   console.log(stringer.decode(Buffer.from('0e77686572652061726520796f753f')))
// } catch (err) { console.log(err.code) }

// // boolean.encode
// try {
//   console.log(booler.encode(true))
// } catch (err) { console.log(err.code) }
// try {
//   console.log(booler.encode(false))
// } catch (err) { console.log(err.code) }
// try {
//   console.log(booler.encode(1 < 0))
// } catch (err) {console.log(err.code) }

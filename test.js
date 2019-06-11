const test = require('tape')
var varint = require('./var-int.js')
var stringer = require('./string.js')
var booler = require('./boolean.js')
var fs = require('fs')

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
  assert.same(varint.encode(0xfd), Buffer.from([0xfd, 0xfd, 0]))
  assert.same(varint.encode.bytes, 3)
  assert.same(varint.encode(0xf0f0f0f), Buffer.from([0xfe, 0xf, 0xf, 0xf, 0xf]))
  assert.same(varint.encode.bytes, 5)
  assert.same(varint.encode(BigInt('0xF0F0F0F0F0E0')), Buffer.from([0xFF, 0xE0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0, 0]))
  assert.same(varint.encode.bytes, 9)

  assert.same(varint.encode(BigInt('0xF0F0F0F0F0E0'), Buffer.alloc(5)), Buffer.from([0xFF, 0xE0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0, 0]))
  assert.same(varint.encode.bytes, 9)
  assert.end()
})

test('varint decode', function (assert) {
  assert.throws(() => varint.decode(null))
  assert.ok(varint.decode.bytes == null)
  assert.throws(() => varint.decode(false))
  assert.ok(varint.decode.bytes == null)
  assert.throws(() => varint.decode(true))
  assert.ok(varint.encode.bytes == null)

  assert.throws(() => varint.decode(true))
  assert.ok(varint.encode.bytes == null)

  // tests from https://docs.rs/bitcoin/0.18.0/src/bitcoin/consensus/encode.rs.html#15-893
  assert.end()
})

return
// varint.decode
try {
  console.log(varint.decode(Buffer.from(null)))
} catch (err) { console.log(err.code) }
try {
  console.log(varint.decode(Buffer.from('fa', 'hex')))
} catch (err) { console.log(err.code) }
try {
  console.log(varint.decode(Buffer.from('fefafed2aa', 'hex')))
} catch (err) { console.log(err.code) }
try {
  console.log(varint.decode(Buffer.from('fffafed2aafffdadff', 'hex')))
} catch (err) { console.log(err.code) }

// string.encode
try {
  console.log(stringer.encode('where are you?'))
} catch (err) { console.log(err.code) }
try {
   var data = fs.readFileSync('./var-int.js')
  console.log(stringer.encode(data.toString()))
} catch (err) { console.log(err.code) }

// string.decode
try {
  console.log(stringer.decode(Buffer.from('0e77686572652061726520796f753f')))
} catch (err) { console.log(err.code) }

// boolean.encode
try {
  console.log(booler.encode(true))
} catch (err) { console.log(err.code) }
try {
  console.log(booler.encode(false))
} catch (err) { console.log(err.code) }
try {
  console.log(booler.encode(1 < 0))
} catch (err) {console.log(err.code) }

const test = require('tape')
var varint = require('./var-int.js')
var string = require('./string.js')
var bool = require('./boolean.js')
var script = require('./scirpt.js')
var fs = require('fs')

var exampleScript = fs.readFileSync('./example.script')
var encodedScript =  Buffer.from('76a90c3c7075626b6579686173683e88ac')

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

test('string encode', function (assert) {
  assert.throws(() => string.encode(null))
  assert.ok(string.encode.bytes == null)
  assert.throws(() => string.encode(false))
  assert.ok(string.encode.bytes == null)
  assert.throws(() => string)
  assert.ok(string.encode.bytes == null)

  assert.same(string.encode("Andrew".toString()), Buffer.from([0x41, 0x6e, 0x64, 0x72, 0x65, 0x77]))
  assert.end()
})

test('script decode', function (assert) {
  assert.throws(() => string.decode(null))
  assert.ok(string.decode.bytes == null)
  assert.throws(() => string.decode(false))
  assert.ok(string.decode.bytes == null)
  assert.throws(() => string)
  assert.ok(string.decode.bytes == null)
})

test('script encode', function (assert) {
  assert.throws(() => script.encode(null))
  assert.ok(script.encode.bytes == null)
  assert.throws(() => script.encode(false))
  assert.ok(script.encode.bytes == null)
  assert.throws(() => script)
  assert.ok(script.encode.bytes == null)
  assert.end()

  assert.deepEqual(script.encode(exampleScript), encodedScript)
  assert.end()
})

test('script decode', function (assert) {
  assert.throws(() => script.decode(null))
  assert.ok(script.decode.bytes == null)
  assert.throws(() => script.decode(false))
  assert.ok(script.decode.bytes == null)
  assert.throws(() => script)
  assert.ok(script.decode.bytes == null)

  assert.equal(script.decode(encodedScript), exampleScript)
  assert.end()
})

test('tx-out encode', function (assert) {

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

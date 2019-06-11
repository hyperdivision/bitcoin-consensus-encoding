var varint = require('./var-uint.js')
var stringer = require('./string-encoder.js')
var booler = require('./boolean.js')
var fs = require('fs')
//varint
try {
  console.log(varint.encode(null))
} catch (err) { console.log(err.code) }
try {
  console.log(varint.encode(0xfff))
} catch (err) { console.log(err.code) }
try {
  console.log(varint.encode(0xfefafefffn))
} catch (err) { console.log(err.code) }
try {
  console.log(varint.encode(0xfeeeeeeeeeeeeeeen))
} catch (err) { console.log(err.code) }

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
  fs.readFile('./var-uint.js', function (err, data) {
    if (err) throw err
    console.log(stringer.encode(data.toString()))
  })
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
}
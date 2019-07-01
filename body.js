var string = require('./string.js')
var int = require('./int.js')
var bool = require('./boolean.js')
var contract = require('./example.json')

function encode (contract, buf, offset) {
  assert(!(buf && offset === undefined), 'offset must be specified to overwrite buf')
  if (!buf) buf = Buffer.alloc(encodingLength(contract))
  if (!offset) offset = 0

  switch (contract['blueprint_type']) {
    case 0x01 : {
      assert(contract['owner_utxo'], 'Owner UTXO must be given.')
      string.encode(contract['owner_utxo'], buf, offset)
      offset += string.encode.bytes

      return buf
    }

    case 0x02 : {
      string.encode(contract['deposit_address'], buf, offset)
      offset += string.encode.bytes

      int.encode(contract['price_sat'], buf, offset, 64)
      offset += int.encode.bytes

      int.encode(contract['from_block'], buf, offset, 16)
      offset += int.encode.bytes
    
      int.encode(contract['to_block'], buf, offset, 16)
      offset += int.encode.bytes

      return buf
    }

    case 0x03 : {
      string.encode(contract['title'], buf, offset)
      offset += string.encode.bytes

      if (contract['description']) {
        string.encode(contract['description'], buf, offset)
        offset += string.encode.bytes
      } else {
        string.encode('', buf, offset)
        offset += string.encode.bytes
      }

      string.encode(contract['network'], buf, offset, true)
      offset += string.encode.bytes

      int.encode(contract['min_amount'], buf, offset, 64)
      offset += int.encode.bytes

      int.encode(contract['max_hops'], buf, offset, 16)
      offset += string.encode.bytes

      string.encode(contract['burn_address'], buf, offset)
      offset += string.encode.bytes

      string.encode(contract['commitment_scheme'], buf, offset, true)
      offset += string.encode.bytes

      return buf
    }
  }
}

function decode (buf, offset, blueprint) {
  var body = {}
  switch (blueprint) {
    case 0x01 : {
      body['owner_utxo'] = string.decode(buf, offset)
      return body
    }

    case 0x02 : {
      body['deposit_address'] = string.decode(buf, offset)
      offset += string.decode.bytes

      body['price_sat'] = int.decode(buf, offset, 8)
      offset += 8

      body['from_block'] = int.decode(buf, offset, 2)
      offset += 2

      body['to_block'] = int.decode(buf, offset, 2)
      offset += 2
    }

    case 0x03 : {
      
    }
  }

}

function encodingLength (contract) {
  var length = 0
  switch (contract['blueprint_type']) {
    case 0x01 : {
      length += string.encodingLength(contract['owner_utxo'])
      return length
    }

    case 0x02 : {
      length += string.encodingLength(contract['deposit_address'])
      length += 64
      length += 16
      length += 16
      return length
    }

    case 0x03 : {
      length += string.encodingLength(contract['title'])
      if (contract['description']) {
        length += string.encodingLength(contract['description'])
      } else {
        length +=1
      }
      length += string.encodingLength(contract['network'], true)
      length += 64
      length += 16
      length += string.encodingLength(contract['burn_address'])
      length += string.encodingLength(contract['commitment_scheme'], true)
      return length
    }
  }
}

message Issue {
  required string owner_utxo = 1
}

message Crowdsale {
  required string deposit_address = 1;
  required int64 price_sat = 2;
  required int16 from_block = 3;
  required int16 to_block = 4
}

message Reissue {
  required string title = 1;
  optional string description = 2;
  required bytes network = 3;
  required int64 min_amount = 4;
  required int16 max_hops = 5;
  required string burn_address = 6;
  required bytes commitment_scheme = 7
}

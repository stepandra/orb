require('dotenv').config();
const {
  deploy,
  call,
  getAccount,
  setQuiet,
  expectToThrow,
  setMockupNow,
  setEndpoint,
  checkBalanceDelta,
  getContract,
  mockupBake,
  getBalance } = require('@completium/completium-cli');
const arnold = getAccount('bootstrap4');
const owner = getAccount('bootstrap1');
const jack = getAccount('bootstrap2');
const bob = getAccount('bootstrap3');
const john = getAccount('bootstrap5');
const nick = getAccount('carl');

const { TezosToolkit } = require('@taquito/taquito');
const { InMemorySigner } = require ('@taquito/signer');
const ORACLE_PUBLIC_KEY = process.env.ORACLE_PUBLIC_KEY || 'edpku2jGfeBS8X8axF5nSsduvwdA8Qq9mVhWjp3uTcQ4EMhbowsL7H';
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;

var oracle_pkey = new InMemorySigner(ORACLE_PRIVATE_KEY);
const Tezos = new TezosToolkit("https://rpc.ghostnet.teztnets.xyz");

Tezos.rpc.packData({
  data: [{
    prim: "Pair",
    args: [
      { string: bob.pkh },
      { int: '333' },
    ]
  },
  {
    prim: "Pair",
    args: [
      { string: john.pkh },
      { int: '233' },
    ]
  },
  {
    prim: "Pair",
    args: [
      { string: jack.pkh },
      { int: '533' },
    ]
  },
  {
    prim: "Pair",
    args: [
      { string: owner.pkh },
      { int: '33' },
    ]
  }], type: {
    prim: "list",
    args: [
      { 
        prim: "pair", 
        args: [{ prim: "string" }, { prim: "nat" }] 
      },
    ]
  }
}).then(wrappedPacked => {
  const hexScore = wrappedPacked.packed;
  oracle_pkey.sign(hexScore).then(s => {
    console.log(`signed: ${s.bytes}`);
    console.log(`sig: ${s.sig}`);
    console.log(`prefix: ${s.prefixSig}`);
    console.log({ packed: wrappedPacked.packed, value: s.prefixSig });
  });
})

const PACKED_OUTCOME = '0502000000b707070100000024747a31666173774354446369527a45346f4a396a6e32566d3264766a6579413966557a55008d0507070100000024747a31646462394e4d59485a6935557a50647a545a4d5951515a6f4d75623139357a677600a90307070100000024747a31676a614638315a525276647a6a6f627966564e7341655343365053636a6651774e00950807070100000024747a314b715470455a37596f62375162504534487934576f38664847384c684b785a53780021';
const SIGNED_OUTCOME = 'edsigtjrbrb6o6R97KeEfvRGYi2aSVk2DHJYMjSYnhvJnxzg3xibS8em61fZchBjmy5TP8s8TGRbH6FaG9ZQbLGYiURLAuxy5uF';

const INVALID_OUTCOME = "edsigtf1PAfNsiJacLrWxY4j8yfFHWyQKdQf1Zatq4sJ3tUsY3RFQAWVLt3mUZACfg52N2zTLzuD1zYJJWk8EdSEnqKPHEsijzk";
const errors = {
  GAME_STILL_ACTIVE: '"GAME_STILL_ACTIVE"',
  NOT_PARTICIPATED: '"NOT_PARTICIPATED"',
  NO_ROOM_ON_THIS_SERVER: '"NO_ROOM_ON_THIS_SERVER"',
  NOTHING_TO_REFUND: '"NOTHING_TO_REFUND"',
  ROOM_IS_FULL: '"ROOM_IS_FULL"',
  ROOM_NOT_FOUND: '"ROOM_NOT_FOUND"',
  INCORRECT_BET_AMOUNT: '"INCORRECT_BET_AMOUNT"',
  WRONG_SERVER: '"WRONG_SERVER"',
  NOT_SIGNED_BY_ORACLE: '"NOT_SIGNED_BY_ORACLE"',
  NO_REFUND_AFTER_START: '"NO_REFUND_AFTER_START"',
}

let room, server, op, oracle;

setQuiet(true);
setEndpoint('mockup')
jest.setTimeout(30000);

// Mockup Time
const now = Math.floor(Date.now() / 1000)
setMockupNow(now)

test('Contract deployed', async () => {
  [oracle, _] = await deploy('./smart-contracts/oracle.arl', {
    parameters: {
      oracle_public_key: ORACLE_PUBLIC_KEY
    },
    as: arnold.pkh
  });
  console.log('Oracle contract deployed! Address: ' + oracle.address);

  [room, op] = await deploy('./smart-contracts/room.arl', {
    parameters: {
      oracle_address: oracle.address
    },
    as: arnold.pkh
  })

  console.log('Room contract deployed! Address: ' + room.address);
});

test('Server created', async () => {
  server = await room.create_server({
    arg: {
      game_duration_v: 3,
      serverd: "NYC",
      size_v: 4,
      bet_size: 1000000,
      serverurl: "https",
      room_idx: "NYC",
      manag: john.pkh,
      server: "NYC"
    },
    as: arnold.pkh
  });
})
console.log( 'owner - ' + owner.pkh + '\n' + 'jack - ' + jack.pkh + '\n' + 'arnold - ' + arnold.pkh + '\n' + 'bob - ' + bob.pkh + '\n');

test('Room filled', async () => {
  var op = await room.enter_room({
    amount: "1tz", arg: {
      room_idv: "NYC",
      serverid: "NYC"
    },
    as: owner.pkh
  })

  var op = await room.enter_room({
    amount: "1tz", arg: {
      room_idv: "NYC",
      serverid: "NYC"
    },
    as: jack.pkh
  })

  var op = await room.enter_room({
    amount: "1tz", arg: {
      room_idv: "NYC",
      serverid: "NYC"
    },
    as: arnold.pkh
  })

  var op = await room.enter_room({
    amount: "1tz", arg: {
      room_idv: "NYC",
      serverid: "NYC"
    },
    as: bob.pkh
  })
})

test('Wrong bet amount', async () => {
  await expectToThrow(async () => {
    await room.enter_room({
      amount: "2tz", arg: {
        room_idv: "NYC",
        serverid: "NYC"
      },
      as: arnold.pkh
    })
  }, errors.INCORRECT_BET_AMOUNT)
})

test('Refund after game started', async () => {
  await expectToThrow(async () => {
    await room.refund({
      arg: {
        room_idq: "NYC",
        server_id: "NYC"
      }, as: arnold.pkh
    })
  }, errors.NO_REFUND_AFTER_START)
})

test('Game still active', async () => {
  await expectToThrow(async () => {
    await room.end_game({
      arg: {
        room_idb: "NYC",
        serverid: "NYC",
        packed_outcome: PACKED_OUTCOME,
        signed_outcome: SIGNED_OUTCOME
      }, as: arnold.pkh
    })
  }, errors.GAME_STILL_ACTIVE)
})

test('Player not inside room', async () => {
  await expectToThrow(async () => {
    await room.end_game({
      arg: {
        room_idb: "NYC",
        serverid: "NYC",
        packed_outcome: PACKED_OUTCOME,
        signed_outcome: SIGNED_OUTCOME
      }, as: nick.pkh
    })
  }, errors.NOT_PARTICIPATED)
})

test('Room not exist on this server', async () => {
  await expectToThrow(async () => {
    await room.end_game({
      arg: {
        room_idb: "NYC_LA",
        serverid: "NYC",
        packed_outcome: PACKED_OUTCOME,
        signed_outcome: SIGNED_OUTCOME
      }, as: arnold.pkh
    })
  }, errors.NO_ROOM_ON_THIS_SERVER)
})

test('Wrong server', async () => {
  await expectToThrow(async () => {
    await room.end_game({
      arg: {
        room_idb: "NYC",
        serverid: "NYC_LA",
        packed_outcome: PACKED_OUTCOME,
        signed_outcome: SIGNED_OUTCOME
      }, as: arnold.pkh
    })
  }, errors.WRONG_SERVER)
})

test('Oracle invalid sign', async () => {
  for (let i = 0; i < 10; i++) {
    await mockupBake()
  }

  await expectToThrow(async () => {
    await room.end_game({
      arg: {
        room_idb: "NYC",
        serverid: "NYC",
        packed_outcome: PACKED_OUTCOME,
        signed_outcome: INVALID_OUTCOME
      }, as: arnold.pkh
    })
  }, errors.NOT_SIGNED_BY_ORACLE)
})

test('Game ended', async () => {
  for (let i = 0; i < 10; i++) {
    await mockupBake()
  }

  var op = await room.end_game({
    arg: {
      room_idb: "NYC",
      serverid: "NYC",
      packed_outcome: PACKED_OUTCOME,
      signed_outcome: SIGNED_OUTCOME
    }, as: owner.pkh
  })
});

/* 4 tez - total bank. 
1 place: 42% from bank == 1.68 tez 
2nd place: 21% from bank == 0.84 tez
3rd place: 14% from bank == 0.56 tez
john.pkh place is 3rd, so win amount == 0.56 tez
john.pkh is server manager, so he receive additional 10% from bank == 0.4 tez. 
Sum: 0.56+0.4 = 0.96tez
*/

test('Correct win amount', async () => {
  await checkBalanceDelta(john.pkh, 0.96, async () => {
    await checkBalanceDelta(jack.pkh, 1.68, async () => {
      await checkBalanceDelta(bob.pkh, 0.84, async () => {
        await mockupBake();
      })
    })
  })
});

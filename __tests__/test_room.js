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
const jack  = getAccount('bootstrap2');
const bob   = getAccount('bootstrap3');
const john = getAccount('bootstrap5');
const nick = getAccount('carl');

const PACKED_OUTCOME = '05020000008a07070100000024747a314b715470455a37596f62375162504534487934576f38664847384c684b785a5378008d0507070100000024747a31566932437371375668786f335a4d796242526e644c75567133573647384e68446b00a50e07070100000024747a31676a614638315a525276647a6a6f627966564e7341655343365053636a6651774e009508';
const SIGNED_OUTCOME = 'edsigtpW3VsUtJypAp2TTSZLAsoczspB4K1pm6tRanoLCHdcfvYmhu58kEbKwWLusJnreQB1DiHQbaaD6F8HbKKp65JaYHSvDXZ';

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
  [oracle, _] = await deploy ('./smart-contracts/oracle.arl', {
    parameters: {},
    as: owner.pkh
  });
  console.log('Oracle contract deployed! Address: ' + oracle.address);

  [room, op] = await deploy ('./smart-contracts/room.arl', {
    parameters: {
      oracle_address: oracle.address
    },
  as: owner.pkh
  })

  console.log('Room contract deployed! Address: ' + room.address);
});

  test('Server created', async () => {
    server = await room.create_server({
      arg: { 
        game_duration_v: 3,
        serverd: "NYC",
        size_v: 5,
        bet_size: 1000000,
        serverurl: "https",
        room_idx: "NYC",
        manag: "tz1Vi2Csq7Vhxo3ZMybBRndLuVq3W6G8NhDk",
        server: "NYC"},
        as: owner.pkh
    });
})


test('Room filled', async () => {
  var op = await room.enter_room({amount: "1tz", arg: {
    room_idv: "NYC",
    serverid: "NYC"
  },
  as: owner.pkh
  })

  var op = await room.enter_room({amount: "1tz", arg: {
    room_idv: "NYC",
    serverid: "NYC"
  },
  as: jack.pkh
  })

  var op = await room.enter_room({amount: "1tz", arg: {
    room_idv: "NYC",
    serverid: "NYC"
  },
  as: john.pkh
  })

  var op = await room.enter_room({amount: "1tz", arg: {
    room_idv: "NYC",
    serverid: "NYC"
  },
  as: arnold.pkh
  })
  var op = await room.enter_room({amount: "1tz", arg: {
    room_idv: "NYC",
    serverid: "NYC"
  },
  as: bob.pkh
  })
})

test('Wrong bet amount', async () => {
  await expectToThrow(async () => {
    await room.enter_room({amount: "2tz", arg: {
      room_idv: "NYC",
      serverid: "NYC"
    },
    as: arnold.pkh
    })
  }, errors.INCORRECT_BET_AMOUNT)
})

test ('Refund after game started', async () => {
  await expectToThrow(async () => {
    await room.refund({
      arg:{
        room_idq: "NYC",
        server_id: "NYC"
      }, as: owner.pkh
    })
  }, errors.NO_REFUND_AFTER_START)
})

test ('Game still active', async () => {
  await expectToThrow(async () => {
    await room.end_game({
      arg:{
        room_idb: "NYC",
        serverid: "NYC",
        packed_outcome: PACKED_OUTCOME,
        signed_outcome: SIGNED_OUTCOME
      }, as: owner.pkh
    })
  }, errors.GAME_STILL_ACTIVE)
})

test ('Player not inside room', async () => {
  await expectToThrow(async () => {
    await room.end_game({
      arg:{
        room_idb: "NYC",
        serverid: "NYC",
        packed_outcome: PACKED_OUTCOME,
        signed_outcome: SIGNED_OUTCOME
      }, as: nick.pkh
    })
  }, errors.NOT_PARTICIPATED)
})

test ('Room not exist on this server', async () => {
  await expectToThrow(async () => {
    await room.end_game({
      arg:{
        room_idb: "NYC_LA",
        serverid: "NYC",
        packed_outcome: PACKED_OUTCOME,
        signed_outcome: SIGNED_OUTCOME
      }, as: owner.pkh
    })
  }, errors.NO_ROOM_ON_THIS_SERVER)
})

test ('Wrong server', async () => {
  await expectToThrow(async () => {
    await room.end_game({
      arg:{
        room_idb: "NYC",
        serverid: "NYC_LA",
        packed_outcome: PACKED_OUTCOME,
        signed_outcome: SIGNED_OUTCOME
      }, as: owner.pkh
    })
  }, errors.WRONG_SERVER)
})

test ('Oracle invalid sign', async () => {
  for(let i=0; i < 10; i++) {
    await mockupBake()
  }

  await expectToThrow(async () => {
    await room.end_game({
      arg:{
        room_idb: "NYC",
        serverid: "NYC",
        packed_outcome: PACKED_OUTCOME,
        signed_outcome: INVALID_OUTCOME
      }, as: owner.pkh
    })
  }, errors.NOT_SIGNED_BY_ORACLE)
})

test('Game ended', async () => {
  for(let i=0; i < 10; i++) {
    await mockupBake()
  } 

  var op = await room.end_game({
    arg:{
      room_idb: "NYC",
      serverid: "NYC",
      packed_outcome: PACKED_OUTCOME,
      signed_outcome: SIGNED_OUTCOME
    }, as: arnold.pkh
  })
})

  test('Correct win amount', async() => {
    await checkBalanceDelta('tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',  0.959704, async () => {
      await checkBalanceDelta(bob.pkh, 0, async () => {
        await mockupBake();
      });
    });
  })
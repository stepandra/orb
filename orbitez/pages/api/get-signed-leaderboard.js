// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { CONTRACT_ADDRESS } from "../../constants";
import axios from "axios";
import inMemoryCache from "memory-cache";

export default async function handler(req, res) {
    const { serverName, statsUrl } = req.body;

    var oracle = new InMemorySigner(process.env.SIGNING_PRIVATE_KEY);
    const RPC_URL = "https://rpc.tzkt.io/ghostnet";
    const Tezos = new TezosToolkit(RPC_URL);

    const contract = await Tezos.contract.at(CONTRACT_ADDRESS);
    const storage = await contract.storage();

    const contractServersMap = storage.server.valueMap;

    const currentServerPlayers = contractServersMap.get(
        `"${serverName}"`
    )?.players;

    const leaderboardMap = new Map();

    currentServerPlayers.forEach((playerName) => {
        leaderboardMap.set(playerName, 0);
    });

    // Collect leaderboard data
    let rawLeaderboard;
    rawLeaderboard = inMemoryCache.get(serverName);

    if (rawLeaderboard == undefined) {
        const result = await axios.get(`http://${statsUrl}`);
        rawLeaderboard = result.data.leaderboard;
        inMemoryCache.put(serverName, rawLeaderboard, 300000); //cache for 5 min
    }

    for (let record of rawLeaderboard) {
        if (record.name == "") continue;
        let [, skin, address] = /^(?:\<([^}]*)\>)?([^]*)/.exec(
            record.name || ""
        );
        leaderboardMap.set(address, Math.round(record.score));
    }

    const fullLeaderboard = Array.from(leaderboardMap, ([address, amount]) => ({
        address,
        amount
    }));

    const listToMichelson = (list) => {
        return list.map((el) => ({
            prim: "Pair",
            args: [{ string: el.address }, { int: el.amount + "" }]
        }));
    };

    Tezos.rpc
        .packData({
            data: listToMichelson(fullLeaderboard),
            type: {
                prim: "list",
                args: [
                    {
                        prim: "pair",
                        args: [{ prim: "string" }, { prim: "nat" }]
                    }
                ]
            }
        })
        .then((wrappedPacked) => {
            const hexScore = wrappedPacked.packed;
            oracle.sign(hexScore).then((s) => {
                res.send({
                    sig: s.sig,
                    value: s.prefixSig,
                    packed: wrappedPacked.packed,
                    signed: s.bytes,
                    leaderboard: fullLeaderboard
                });
                res.end();
            });
        });
}

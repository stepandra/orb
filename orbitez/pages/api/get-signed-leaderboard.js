// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { CONTRACT_ADDRESS } from "../../constants";
import axios from "axios";
import inMemoryCache from "memory-cache";

export default async function handler(req, res) {
  const { server } = req.body
  var oracle = new InMemorySigner(process.env.SIGNING_PRIVATE_KEY);
  const Tezos = new TezosToolkit("https://api.ghostnet.tzkt.io/");
  let contractServerList = []

    const contract = await Tezos.wallet.at(CONTRACT_ADDRESS);
    const storage = await contract.storage();

    for (let [key, value] of storage.server.valueMap) {
        contractServerList.push({ ...value, name: key });
    }

    // Collect leaderboard data
    let leaderboard;
    leaderboard = inMemoryCache.get(server);

    if (leaderboard == undefined) {
        const result = await axios.get("http://orbitez-stats.eu.ngrok.io");
        leaderboard = result.data.leaderboard;
        inMemoryCache.put(server, leaderboard, 300000); //cache for 5 min
    }

    const newMapfromLiteral = [];

    for (let record of leaderboard) {
        if (record.name == "") continue;
        let [, skin, address] = /^(?:\<([^}]*)\>)?([^]*)/.exec(
            record.name || ""
        );
        newMapfromLiteral.push({
            address,
            amount: Math.round(record.score),
        });
    }

    const listToMichelson = (list) => {
        return list.map((el) => ({
            prim: "Pair",
            args: [{ string: el.address }, { int: el.amount + "" }],
        }));
    };

    Tezos.rpc
        .packData({
            data: listToMichelson(newMapfromLiteral),
            type: {
                prim: "list",
                args: [
                    {
                        prim: "pair",
                        args: [{ prim: "string" }, { prim: "nat" }],
                    },
                ],
            },
        })
        .then((wrappedPacked) => {
            const hexScore = wrappedPacked.packed;
            oracle.sign(hexScore).then((s) => {
                res.send({
                    sig: s.sig,
                    value: s.prefixSig,
                    packed: wrappedPacked.packed,
                    signed: s.bytes,
                    leaderboard: newMapfromLiteral,
                });
            });
        });
}

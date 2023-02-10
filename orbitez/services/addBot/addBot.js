import axios from "axios";
import { TezosToolkit } from "@taquito/taquito";
import {
    BOTS,
    MIN_BOT_JOIN_TIME,
    RPC_URL,
    CONTRACT_ADDRESS,
    BASE_TZKT_API_URL,
} from "../../constants";
import recursivelyTryAddingBot from "./infra/recursivelyTryAddingBot";
import pendingBotTransactions from "./infra/PendingBotTransactions";

export default async function addBot(serverName) {
    return new Promise(async (resolve, reject) => {
        try {
            const Tezos = new TezosToolkit(RPC_URL);

            const contract = await Tezos.contract.at(CONTRACT_ADDRESS);
            const storage = await contract.storage();

            // Checking if the passed serverName is in the contract
            const contractServers = storage.server.valueMap;
            if (!contractServers.has(`"${serverName}"`)) {
                reject({
                    status: 400,
                    json: {
                        error: `The requested server '${serverName}' is not registered in the contract`,
                    },
                });
                return;
            };

            // Checking if there isn't a pending bot adding transaction for this server
            if (
                pendingBotTransactions.isThereAPendingTransaction(serverName) &&
                !pendingBotTransactions.isPendingTransactionConfirmed(serverName)
            ) {
                reject({
                    status: 500,
                    json: {
                        error: "A request for the addition of a bot for this server has already been sent",
                    },
                });
                return;
            }

            // Selecting all the players who are in the contract's storage
            // (in the waiting room or in the game)
            const contractPlayers = storage.player.valueMap;

            // Filter by passed server
            const currentServerWaitRoomPlayers = [];

            contractPlayers.forEach((playerData, playerName) => {
                if (playerData.room_id === serverName) {
                    currentServerWaitRoomPlayers.push({
                        name: playerName.match(/[a-zA-Z0-9]+/)?.[0],
                        ...playerData,
                    });
                }
            });

            // Checking if there are players in the waiting room
            if (currentServerWaitRoomPlayers.length === 0) {
                reject({
                    status: 500,
                    json: {
                        error: `Server '${serverName}' has no players in the waiting room`,
                    },
                });
                return;
            }

            // Checking if the server has a finish_block, which means that ...
            // .. the game has already started
            const contractRooms = storage.room.valueMap;
            const currentRoom = contractRooms.get(`"${serverName}"`);
            if (!currentRoom.finish_block.isZero()) {
                reject({
                    status: 500,
                    json: {
                        error: `The game on the '${serverName}' server has already started`,
                    },
                });
                return;
            }

            // Checking which of the players in the waiting room has the largest entry_block ...
            // .. value - this will be the most recently joined player

            let latestJoinedPlayer;

            if (currentServerWaitRoomPlayers.length === 1) {
                latestJoinedPlayer = currentServerWaitRoomPlayers[0];
            } else {
                latestJoinedPlayer = currentServerWaitRoomPlayers.reduce(
                    (prevPlayer, currPlayer) => {
                        const prevPlayerEntryBlock = prevPlayer.entry_block.toNumber();
                        const currPlayerEntryBlock = currPlayer.entry_block.toNumber();

                        if (prevPlayerEntryBlock >= currPlayerEntryBlock) {
                            return prevPlayer;
                        }
                        return currPlayer;
                    },
                );
            }

            // Fetching the block timestamp - this will be the most recent player's joining timestamp

            const latestJoinedPlayerBlock = latestJoinedPlayer.entry_block.toNumber();

            const { data: latestJoinedPlayerBlockDatetime } = await axios({
                method: "GET",
                url: `/blocks/${latestJoinedPlayerBlock}/timestamp`,
                baseURL: BASE_TZKT_API_URL,
            });

            const latestJoinedTimestamp = new Date(
                latestJoinedPlayerBlockDatetime,
            ).getTime();

            const currentTimestamp = Date.now();

            // Calculating whether MIN_BOT_JOIN_TIME have passed since the last player joined

            const timeElapsedSinceLastJoin = currentTimestamp - latestJoinedTimestamp;

            // If MIN_BOT_JOIN_TIME have not elapsed responding with an error
            if (timeElapsedSinceLastJoin < MIN_BOT_JOIN_TIME) {
                reject({
                    status: 500,
                    json: {
                        error: "The required 5 minutes to add a bot have not yet passed",
                    },
                });
                return;
            }

            // If MIN_BOT_JOIN_TIME have elapsed:
            // Creating an availableBots array from the bots, who are not registered as players in the contract
            const availableBots = BOTS.filter(
                (bot) => !contractPlayers.has(`"${bot.address}"`),
            );

            if (availableBots.length === 0) {
                reject({
                    status: 500,
                    json: {
                        error: "No available bots",
                    },
                });
                return;
            }

            // Recursively trying to add a bot, in case of an error - trying the next and so on
            // If successful - responding with an operation hash
            // If not successful (or if any other error was catched inside try/catch block) - ...
            // .. responding with an error

            const operationHash = await recursivelyTryAddingBot(availableBots, serverName);
            resolve(operationHash);
        } catch (error) {
            reject({
                status: 500,
                json: {
                    error: "Cannot add a bot",
                },
            });
            console.error(error);
        }
    });
}

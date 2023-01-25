const signalR = require("@microsoft/signalr");
const axios = require("axios");

class Mode {
    constructor() {
        this.ID = -1;
        this.name = "Blank";
        this.decayMod = 1.0; // Modifier for decay rate (Multiplier)
        this.packetLB = 49; // Packet id for leaderboard packet (48 = Text List, 49 = List, 50 = Pie chart)
        this.haveTeams = false; // True = gamemode uses teams, false = gamemode doesnt use teams
        this.specByLeaderboard = false; // false = spectate from player list instead of leaderboard
        this.IsTournament = false;
        this.playersInRoom = [];
    }
    // Override these
    onServerInit(server) {
        const signalR = require("@microsoft/signalr");

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://api.ghostnet.tzkt.io/v1/events") //https://api.tzkt.io/ MAINNEt
            .build();

        async function init() {
            // open connection
            await connection.start();
            // subscribe to head
            await connection.invoke("SubscribeToBlocks");

            await connection.invoke("SubscribeToOperations", {
                address: "KT1NXgqXUfYFowmoZK6FhUTxmcqkjzZnV5rg",
                types: "transaction",
            });
        }

        // auto-reconnect
        connection.onclose(init);

        connection.on("blocks", async (msg) => {
            const contractAddress = process.env.CONTRACT_ADDRESS;
            const serverName = process.env.SERVER_NAME;

            console.log(
                `connecting to contract ${contractAddress}, room ${serverName}`
            );
            const { endBlock } = await axios
                .get(
                    `https://api.ghostnet.tzkt.io/v1/contracts/${contractAddress}/storage`
                )
                .then((res) => {
                    this.playersInRoom =
                        res.data.server[serverName]?.players || [];
                    return {
                        endBlock: res.data.room[serverName]?.finish_block,
                    };
                });

            if (msg.state > Number(endBlock)) {
                console.log({
                    currentBlock: msg.state,
                    endBlock: Number(endBlock),
                });
                this.killall(server);
            }
        });

        connection.on("operations", (msg) => {
            // console.log('TRANS', msg);
        });

        init();
        // Called when the server starts
        server.run = true;
    }

    killall(server) {
        // Check if server is empty.
        if (!server.clients.length) {
            console.log("The server is empty.");
        }
        for (const socket of server.clients) {
            const client = socket.player;
            while (client.cells.length) server.removeNode(client.cells[0]);
        }
        console.log("Removed all players.");
    }

    onTick(server) {
        const allowedPlayersSet = new Set(this.playersInRoom);
        const encounteredPlayers = new Map();

        const killPlayer = (client) => {
            if (!client || !client.cells) return;
            while (client.cells.length) server.removeNode(client.cells[0]);
        };

        if (this.playersInRoom.length) {
            for (const socket of server.clients) {
                const client = socket.player;
                const name = client._name;
                // Kill users whos names aren't in the storage
                if (!allowedPlayersSet.has(name)) {
                    killPlayer(client);
                } else {
                    // Kill users who are present two or more times in the game
                    if (encounteredPlayers.has(name)) {
                        const dupeClient = encounteredPlayers.get(name);
                        killPlayer(client);
                        killPlayer(dupeClient);
                    }
                    encounteredPlayers.set(name, client);
                }
            }
        }
    }

    onPlayerInit(player) {
        // Called after a player object is constructed
    }
    onPlayerSpawn(server, player) {
        // Called when a player is spawned
        player.color = server.getRandomColor(); // Random color
        server.spawnPlayer(player, server.randomPos());
    }
    onCellAdd(cell) {
        // Called when a player cell is added
    }
    onCellRemove(cell) {
        // Called when a player cell is removed
    }
    updateLB(server) {
        // Called when the leaderboard update function is called
        server.leaderboardType = this.packetLB;
    }
}

module.exports = Mode;

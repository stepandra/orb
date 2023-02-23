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
        this.endBlock = 0;
        this.botNames = [
            '<ooB61YHhctUebh3BnRu2hiQi9KkzfMyk8mLg1aqs2d3Rhmvji4C>tz1MbdMtM84TvhHundn2EUfZfvTpZY5G348z',
            '<ooNvSZJ4s56csoWnMcFaWz5tXpAFigAcs8Dck7gou8Th9hBK72Y>tz1exhJ7rXiMNuHQEPGLuXZAwmtQwkQUjv94',
            '<oouYgHur5bYu4DCnr2vDoxomAcTsFhcGEJMsEonsmLzEjA6wQEp>tz1ZrPyokyWHPWFY6mdNHJevnoz4i29hW527',
            '<ooKg2zuJu9XhZBRKQaBrEDvpeYZjDPmKREp3PMSZHLkoSFK3ejN>tz1P11BBtgafonerKE2E1x91b8CKSE2tAnf9',
            '<ooKGM85ryZMiX9PeNykN5pdF8CzT7F9qZUEe7XmTWw9kZtpVaCK>tz1L4xFDyB3HQV5YXkQxu5t5BWHdwQQe4NJr',
            '<oo1zns8orDCX4gKuoFqwSfcZLsDXMgcuN6yAdkvzhiiwkS852Af>tz1YCQ44pjU4DJZoB7sMT1QymUbf8Nf71Sdr',
            '<opaFcbxm1Kzz9FDdf1oUQFog5uNaJkPrXUt6Yk3R4bUCnaqwPRN>tz1LGQ1JFhy8FmJ7w1UrWx84rtJQRd6mM3CE'
        ]
    }
    // Override these
    onServerInit(server) {
        if (process.env.STAGE === "local") return;

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

            const currentBlock = msg.state;

            console.log(
                `connecting to contract ${contractAddress}, room ${serverName}`
            );
            const { endBlock } = await axios
                .get(
                    `https://api.ghostnet.tzkt.io/v1/contracts/${contractAddress}/storage`
                )
                .then((res) => {
                    const endBlock = Number(res.data.room[serverName]?.finish_block);
                    this.endBlock = endBlock;

                    if (endBlock !== 0 && currentBlock <= endBlock) {
                        this.playersInRoom =
                            res.data.server[serverName]?.players || [];
                    } else {
                        this.playersInRoom = [];
                    };
                    
                    return { endBlock };
                });

            if (currentBlock > endBlock) {
                console.log({
                    currentBlock: currentBlock,
                    endBlock: endBlock,
                });
            }
        });

        connection.on("operations", (msg) => {
            // console.log('TRANS', msg);
        });

        init();
        // Called when the server starts
        server.run = true;
    }

    killPlayer(socket, server) {
        const { player } = socket;
        if (!player || !player.cells) return;

        while (player.cells.length) server.removeNode(player.cells[0]);

        if (player.isBot) {
            socket.close();
            return;
        };
    };

    killAll(server) {
        // Check if server is empty.
        if (!server.clients.length) {
            console.log("The server is empty.");
        }
        for (const socket of server.clients) {
            this.killPlayer(socket, server);
        }
        console.log("Removed all players.");
    }

    onTick(server) {
        if (process.env.STAGE === "local") return;
        
        const allowedPlayersSet = new Set(this.playersInRoom);
        const encounteredPlayers = new Map();
        const serverPlayers = new Set(server.clients.map((socket) => socket.player._name));
        const alivePlayers = server.clients.flatMap((socket) => {
            const { player } = socket;

            if (!player || !player.cells || player.cells.length === 0) return [];

            return [ player._name ];
        });

        this.botNames.forEach((botNameWithSkin) => {
            const botName = botNameWithSkin.match(/(?:<.*>)?([\w\d]+)/)?.[1];
            if (
                !allowedPlayersSet.has(botName) ||
                serverPlayers.has(botNameWithSkin)
            ) return;

            server.bots.addBot({botName: botNameWithSkin, useRandomName: false});
        });

        // Killing of not allowed players

        // Kill everyone, when the game is not running and there are alive players / bots
        if (alivePlayers.length !== 0 && allowedPlayersSet.size === 0) {
            this.killAll(server);
            return;
        };
        
        // When the game is running
        for (const socket of server.clients) {
            const client = socket.player;
            const name = client._name.match(/(?:<.*>)?([\w\d]+)/)?.[1];
            // Kill users whos names aren't in the storage
            if (!allowedPlayersSet.has(name)) {
                this.killPlayer(client, server);
            } else {
                // Kill users who are present two or more times in the game
                if (encounteredPlayers.has(name)) {
                    const dupeClient = encounteredPlayers.get(name);
                    this.killPlayer(client, server);
                    this.killPlayer(dupeClient, server);
                }
                encounteredPlayers.set(name, client);
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

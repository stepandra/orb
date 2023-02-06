// Library imports
const fs = require("fs");

// Project imports
const FakeSocket = require('./FakeSocket');
const Client = require('../Client');
const BotPlayer = require('./BotPlayer');
const MinionPlayer = require('./MinionPlayer');

const botnameFile = "src/ai/botnames.txt";
let botnames = null;

if (fs.existsSync(botnameFile)) {
    console.log(botnameFile);
    botnames = fs.readFileSync(botnameFile, "utf-8").split("\n");
    console.log(botnames);
} else {
    console.log("No botname")
}


class BotLoader {
    constructor(server) {
        this.server = server;
        this.botCount = 0;
    }
    addBot({botName = undefined, useRandomName = false}) {
        // Create a FakeSocket instance and assign its properties.
        const socket = new FakeSocket(this.server);
        socket.player = new BotPlayer(this.server, socket);
        socket.client = new Client(this.server, socket);

        const name = useRandomName ? botnames[this.botCount++ | 0] : botName;

        // Add to client list and spawn.
        this.server.clients.push(socket);
        socket.client.setNickname(name);
    }
    addMinion(owner, name, mass) {
        // Aliases
        const maxSize = this.server.config.minionMaxStartSize;
        const defaultSize = this.server.config.minionStartSize;

        // Create a FakeSocket instance and assign its properties.
        const socket = new FakeSocket(this.server);
        socket.player = new MinionPlayer(this.server, socket, owner);
        socket.client = new Client(this.server, socket);

        // Set minion spawn size
        socket.player.spawnmass = mass || maxSize > defaultSize ? Math.floor(Math.random() * (maxSize - defaultSize) + defaultSize) : defaultSize;

        // Add to client list
        this.server.clients.push(socket);

        // Add to world
        socket.client.setNickname(name == "" || !name ? this.server.config.defaultName : name);
    }
}

module.exports = BotLoader;

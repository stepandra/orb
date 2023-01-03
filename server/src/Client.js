const WebSocket = require("ws");
const Packet = require('./packet');
const BinaryReader = require('./packet/BinaryReader');
const fs = require("fs");

const randomSkinsFile = "../src/randomskins.txt";
let randomSkins = [];
if (fs.existsSync(randomSkinsFile)) {
    // Read and parse the Skins - filter out whitespace-only Skins
    randomSkins = fs.readFileSync(randomSkinsFile, "utf8")
        .split(/[\r\n]+/).filter(x => x != ''); // filter empty Skins
}

class Client {
    constructor(server, socket) {
        this.server = server;
        this.socket = socket;
        this.protocol = 0;
        this.handshakeProtocol = null;
        this.handshakeKey = null;
        this.lastJoinTick = 0;
        this.lastChatTick = 0;
        this.lastStatTick = 0;
        this.toggleSpectate = false;
        this.ejectRequested = false;
        this.splitRequested = false;
        this.mouseData = null;
        this.handler = {
            254: this.handshake_onProtocol.bind(this),
        };
    }
    handleMessage(message) {
        if (!this.handler.hasOwnProperty(message[0])) return;
        this.handler[message[0]](message);
        this.socket.lastAliveTime = this.server.stepDateTime;
    }
    handshake_onProtocol(message) {
        if (message.length !== 5) return;
        this.handshakeProtocol = message[1] | (message[2] << 8) | (message[3] << 16) | (message[4] << 24);
        if (this.handshakeProtocol < 1 || this.handshakeProtocol > 18) {
            this.socket.close(1002, "Not supported protocol: " + this.handshakeProtocol);
            return;
        }
        this.handler = {
            255: this.handshake_onKey.bind(this),
        };
    }
    handshake_onKey(message) {
        if (message.length !== 5) return;
        this.handshakeKey = message[1] | (message[2] << 8) | (message[3] << 16) | (message[4] << 24);
        if (this.handshakeProtocol > 6 && this.handshakeKey !== 0) {
            this.socket.close(1002, "Not supported protocol");
            return;
        }
        this.handshake_onCompleted(this.handshakeProtocol, this.handshakeKey);
    }
    handshake_onCompleted(protocol, key) {
        this.handler = {
            0: this.message_onJoin.bind(this),
            1: this.message_onSpectate.bind(this),
            16: this.message_onMouse.bind(this),
            17: this.msg_split.bind(this),
            18: this.msg_spectateToggle.bind(this),
            21: this.msg_eject.bind(this),
            22: this.msg_minionSplit.bind(this),
            23: this.msg_minionEject.bind(this),
            24: this.msg_minionFreezeToggle.bind(this),
            99: this.message_onChat.bind(this),
            254: this.message_onStat.bind(this),
        };
        this.protocol = protocol;
        // Send handshake response
        this.sendPacket(new Packet.ClearAll());
        this.sendPacket(new Packet.SetBorder(this.socket.player, this.server.border, this.server.config.serverGamemode, "MultiOgarII " + this.server.version));
        // Send welcome message
        this.server.sendChatMessage(null, this.socket.player, "MultiOgarII " + this.server.version);
        if (this.server.config.serverWelcome1)
            this.server.sendChatMessage(null, this.socket.player, this.server.config.serverWelcome1);
        if (this.server.config.serverWelcome2)
            this.server.sendChatMessage(null, this.socket.player, this.server.config.serverWelcome2);
        if (this.server.config.serverChat == 0)
            this.server.sendChatMessage(null, this.socket.player, "This server's chat is disabled.");
        if (this.protocol < 4)
            this.server.sendChatMessage(null, this.socket.player, `WARNING: Protocol ${this.protocol} assumed as 4!`);
    }
    message_onJoin(message) {
        const tick = this.server.ticks;
        const dt = tick - this.lastJoinTick;
        this.lastJoinTick = tick;
        if (dt < 25 || this.socket.player.cells.length !== 0) return;
        var reader = new BinaryReader(message);
        reader.skipBytes(1);
        var text = null;
        if (this.protocol < 6) text = reader.readStringZeroUnicode();
        else text = reader.readStringZeroUtf8();
        this.setNickname(text);
    }
    message_onSpectate(message) {
        if (message.length !== 1 || this.socket.player.cells.length !== 0)
            return;
        this.socket.player.spectate = true;
        this.socket.player.freeRoam = false;
    }
    message_onMouse(message) {
        if (message.length !== 13 && message.length !== 9
            && message.length !== 21) return;
        this.mouseData = Buffer.concat([message]);
    }
    msg_split(message) {
        this.splitRequested = true;
    }
    msg_spectateToggle(message) {
        if (message.length !== 1) return;
        else this.toggleSpectate = true;
    }
    msg_eject(message) {
        if (message.length !== 1) return;
        else this.ejectRequested = true;
    }
    msg_minionSplit(message) {
        this.socket.player.minionSplit = true;
    }
    msg_minionEject(message) {
        this.socket.player.minionEject = true;
    }
    msg_minionFreezeToggle(message) {
        this.socket.player.minionFrozen = !this.socket.player.minionFrozen;
    }
    message_onChat(message) {
        if (message.length < 3) return;
        const tick = this.server.ticks
        const dt = tick - this.lastChatTick;
        this.lastChatTick = tick;
        if (dt < 25 * 2) return;
        const flags = message[1]; // flags
        const rvLength = (flags & 0b1110) * 2;
        if (message.length < 3 + rvLength) return; // second validation
        let reader = new BinaryReader(message);
        reader.skipBytes(2 + rvLength); // reserved
        let text = null;
        if (this.protocol < 6) text = reader.readStringZeroUnicode();
        else text = reader.readStringZeroUtf8();
        this.server.onChatMessage(this.socket.player, null, text);
    }
    message_onStat(message) {
        if (message.length !== 1) return;
        const dt = this.server.ticks - this.lastStatTick;
        this.lastStatTick = this.server.ticks;
        if (dt < 25) return;
        this.sendPacket(new Packet.ServerStat(this.socket.player));
    }
    processMouse() {
        if (this.mouseData == null) return;
        let player = this.socket.player;
        var reader = new BinaryReader(this.mouseData);
        reader.skipBytes(1);
        if (this.mouseData.length === 13) {
            // protocol late 5, 6, 7
            player.mouse.x = reader.readInt32() - player.scrambleX;
            player.mouse.y = reader.readInt32() - player.scrambleY;
        } else if (this.mouseData.length === 9) {
            // early protocol 5
            player.mouse.x = reader.readInt16() - player.scrambleX;
            player.mouse.y = reader.readInt16() - player.scrambleY;
        } else if (this.mouseData.length === 21) {
            // protocol 4
            player.mouse.x = ~~reader.readDouble() - player.scrambleX;
            player.mouse.y = ~~reader.readDouble() - player.scrambleY;
        }
        this.mouseData = null;
    }
    process() {
        if (this.splitRequested) {
            this.socket.player.split();
            this.splitRequested = false;
        }
        if (this.ejectRequested) {
            this.socket.player.eject();
            this.ejectRequested = false;
        }
        if (this.toggleSpectate) {
            this.socket.player.spectateToggle();
            this.toggleSpectate = false;
        }
        if (this.socket.player.minionSplit)
            this.socket.player.minionSplit = false;
        if (this.socket.player.minionEject)
            this.socket.player.minionEject = false;
        this.processMouse();
    }
    getRandomSkin() {
        // Picks a random skin
        if (randomSkins.length > 0) {
            const index = randomSkins.length * Math.random() | 0;
            return randomSkins[index];
        }
        return '';
    }
    setNickname(text) {
        var name = "", skin = null;
        if (text != null && text.length > 0) {
            var skinName = null, userName = text, n = -1;
            if (text[0] == '<' && (n = text.indexOf('>', 1)) >= 1) {
                var inner = text.slice(1, n);
                if (n > 1)
                    skinName = (inner == "r") ? this.getRandomSkin() : inner;
                else skinName = "";
                userName = text.slice(n + 1);
            }
            skin = skinName;
            name = userName;
        }
        if (name.length > this.server.config.playerMaxNickLength)
            name = name.substring(0, this.server.config.playerMaxNickLength);
        if (this.server.checkBadWord(name)) {
            skin = null;
            name = "Hi there!";
        }
        this.socket.player.joinGame(text, skin);
    }
    sendPacket(packet) {
        var socket = this.socket;
        if (!packet || !socket.isConnected || socket.player.isMi ||
            socket.player.isBot) return;
        if (socket.readyState == WebSocket.OPEN) {
            var buffer = packet.build(this.protocol);
            if (buffer) socket.send(buffer, { binary: true });
        }
    }
}

module.exports = Client;

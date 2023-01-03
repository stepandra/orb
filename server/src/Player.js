const Packet = require('./packet');
const Vec2 = require('./modules/Vec2');
const BinaryWriter = require("./packet/BinaryWriter");
const {Quad} = require("./modules/QuadNode.js");
const UserRoleEnum = require("./enum/UserRoleEnum");

class Player {
    constructor(server, socket) {
        this.server = server;
        this.socket = socket;
        this.pID = -1;
        this.userAuth = null;
        this.isRemoved = false;
        this.isCloseRequested = false;
        this._name = "";
        this._skin = "";
        this._nameUtf8 = null;
        this._skinUtf8protocol11 = null;
        this._nameUnicode = null;
        this._skinUtf8 = null;
        this.color = { r: 0, g: 0, b: 0 };
        this.viewNodes = [];
        this.clientNodes = [];
        this.cells = [];
        this.mergeOverride = false; // Triggered by console command
        this._score = 0; // Needed for leaderboard
        this._scale = 1;
        this.borderCounter = 0;
        this.connectedTime = new Date();
        this.tickLeaderboard = 0;
        this.team = 0;
        this.spectate = false;
        this.freeRoam = false; // Free-roam mode enables player to move in spectate mode
        this.spectateTarget = null; // Spectate target, null for largest player
        this.lastKeypressTick = 0;
        this.centerPos = new Vec2(0, 0);
        this.mouse = new Vec2(0, 0);
        this.viewBox = new Quad(0, 0, 0, 0);
        // Scramble the coordinate system for anti-raga
        this.scrambleX = 0;
        this.scrambleY = 0;
        this.scrambleId = 0;
        this.isMinion = false;
        this.isMuted = false;
        // Custom commands
        this.spawnmass = 0;
        this.frozen = false;
        this.customspeed = 0;
        this.rec = false;
        // Minions
        this.isMi = false;
        this.minionSplit = false;
        this.minionEject = false;
        this.minionFrozen = false;
        this.hasMinions = server.config.serverMinions > 0;
        // Gamemode function
        if (server) {
            // Player id
            this.pID = server.lastPlayerId++ >> 0;
            // Gamemode function
            server.mode.onPlayerInit(this);
            // Only scramble if enabled in config
            this.scramble();
        }
        this.userRole = UserRoleEnum.GUEST;
    }
    // Setters/Getters
    scramble() {
        if (!this.server.config.serverScrambleLevel) {
            this.scrambleId = 0;
            this.scrambleX = 0;
            this.scrambleY = 0;
        } else {
            this.scrambleId = (Math.random() * 0xFFFFFFFF) >>> 0;
            // avoid mouse packet limitations
            var maxx = Math.max(0, 31767 - this.server.border.width);
            var maxy = Math.max(0, 31767 - this.server.border.height);
            var x = maxx * Math.random();
            var y = maxy * Math.random();
            if (Math.random() >= 0.5) x = -x;
            if (Math.random() >= 0.5) y = -y;
            this.scrambleX = x;
            this.scrambleY = y;
        }
        this.borderCounter = 0;
    }
    setName(name) {
        this._name = name;
        var writer = new BinaryWriter();
        writer.writeStringZeroUnicode(name);
        this._nameUnicode = writer.toBuffer();
        writer = new BinaryWriter();
        writer.writeStringZeroUtf8(name);
        this._nameUtf8 = writer.toBuffer();
    }
    setSkin(skin) {
        this._skin = skin;
        var writer = new BinaryWriter();
        writer.writeStringZeroUtf8(skin);
        this._skinUtf8 = writer.toBuffer();
        var writer1 = new BinaryWriter();
        writer1.writeStringZeroUtf8("%" + skin);
        this._skinUtf8protocol11 = writer1.toBuffer();
    }
    getLivingScale() {
        this._score = 0; // reset to not cause bugs with leaderboard
        let scale = 0; // reset to not cause bugs with viewbox
        for (const cell of this.cells) {
            scale += cell.radius;
            this._score += cell._mass;
        }
        if (scale) scale = Math.pow(Math.min(64 / scale, 1), 0.4);
        return Math.max(scale, this.server.config.serverMinScale)
    }
    joinGame(name, skin) {
        if (this.cells.length) return;
        if (skin) this.setSkin(skin);
        if (!name) name = "";
        this.setName(name);
        this.spectate = false;
        this.freeRoam = false;
        this.spectateTarget = null;
        var client = this.socket.client;
        if (!this.isMi && this.socket.isConnected != null) {
            // some old clients don't understand ClearAll message
            // so we will send update for them
            if (client.protocol < 6) {
                client.sendPacket(new Packet.UpdateNodes(this, [], [], [], this.clientNodes));
            }
            client.sendPacket(new Packet.ClearAll());
            this.clientNodes = [];
            this.scramble();
            if (this.server.config.serverScrambleLevel < 2) {
                // no scramble / lightweight scramble
                client.sendPacket(new Packet.SetBorder(this, this.server.border));
            } else if (this.server.config.serverScrambleLevel == 3) {
                var ran = 10065536 * Math.random();
                // Ruins most known minimaps (no border)
                var border = new Quad(
                    this.server.border.minx - ran,
                    this.server.border.miny - ran,
                    this.server.border.maxx + ran,
                    this.server.border.maxy + ran
                );
                client.sendPacket(new Packet.SetBorder(this, border));
            }
        }
        this.server.mode.onPlayerSpawn(this.server, this);
    }
    checkConnection() {
        // Handle disconnection
        if (!this.socket.isConnected) {
            // Wait for playerDisconnectTime
            var pt = this.server.config.playerDisconnectTime;
            var dt = (this.server.stepDateTime - this.socket.closeTime) / 1e3;
            if (pt && (!this.cells.length || dt >= pt)) {
                // Remove all client cells
                while (this.cells.length)
                    this.server.removeNode(this.cells[0]);
            }
            this.cells = [];
            this.isRemoved = true;
            this.mouse = null;
            this.socket.client.splitRequested = false;
            this.socket.client.toggleSpectate = false;
            this.socket.client.ejectRequested = false;
            return;
        }
        // Check timeout
        if (!this.isCloseRequested && this.server.config.serverTimeout) {
            dt = (this.server.stepDateTime - this.socket.lastAliveTime) / 1000;
            if (dt >= this.server.config.serverTimeout) {
                this.socket.close(1000, "Connection timeout");
                this.isCloseRequested = true;
            }
        }
    }
    updateTick() {
        if (this.isRemoved || this.isMinion) return; // do not update
        this.socket.client.process();
        if (this.isMi) return;
        this.updateView(this.cells.length);
        const posPacket = new Packet.UpdatePosition(this, this.centerPos.x,
            this.centerPos.y, this._scale)
        this.socket.client.sendPacket(posPacket);
        const halfWidth = (this.server.config.serverViewBaseX + 100) / this._scale / 2;
        const halfHeight = (this.server.config.serverViewBaseY + 100) / this._scale / 2;
        this.viewBox = new Quad(
            this.centerPos.x - halfWidth,
            this.centerPos.y - halfHeight,
            this.centerPos.x + halfWidth,
            this.centerPos.y + halfHeight
        );
        // update visible nodes
        this.viewNodes = this.server.quadTree.allOverlapped(this.viewBox);
        this.viewNodes.sort((a, b) => a.nodeId - b.nodeId);
    }
    sendUpdate() {
        // do not send update for disconnected clients
        // also do not send if initialization is not complete yet
        if (this.isRemoved || !this.socket.client.protocol ||
            !this.socket.isConnected || this.isMi || this.isMinion ||
            (this.socket._socket.writable != null && !this.socket._socket.writable) ||
            this.socket.readyState != this.socket.OPEN) return;
        const client = this.socket.client;
        if (this.server.config.serverScrambleLevel == 2) {
            if (!this.borderCounter) {
                var b = this.server.border, v = this.viewBox;
                var bound = new Quad(
                    Math.max(b.minx, v.minx - v.halfWidth),
                    Math.max(b.miny, v.miny - v.halfHeight),
                    Math.min(b.maxx, v.maxx + v.halfWidth),
                    Math.min(b.maxy, v.maxy + v.halfHeight)
                );
                client.sendPacket(new Packet.SetBorder(this, bound));
            }
            if (++this.borderCounter >= 20) this.borderCounter = 0;
        }
        const delNodes = [];
        const eatNodes = [];
        const addNodes = [];
        const updNodes = [];
        let clientIndex = 0;
        let viewIndex = 0;
        const viewNodesLength = this.viewNodes.length; // don't count nodes added in the loop
        while (viewIndex < viewNodesLength &&
            clientIndex < this.clientNodes.length)
        {
            const viewNode = this.viewNodes[viewIndex];
            const clientNode = this.clientNodes[clientIndex];
            if (viewNode.nodeId < clientNode.nodeId) {
                if (!viewNode.isRemoved) addNodes.push(viewNode);
                ++viewIndex;
            } else if (viewNode.nodeId > clientNode.nodeId) {
                if (clientNode.isRemoved) eatNodes.push(clientNode);
                else if (clientNode.owner != this) delNodes.push(clientNode);
                else {
                    updNodes.push(clientNode);
                    this.viewNodes.push(clientNode);
                }
                ++clientIndex;
            } else {
                if (viewNode.isRemoved) eatNodes.push(viewNode);
                else if (viewNode.isMoving || viewNode.type == 0 ||
                    viewNode.type == 2 ||
                    this.server.config.serverGamemode == 3 &&
                    viewNode.type == 1) updNodes.push(viewNode);
                ++viewIndex;
                ++clientIndex;
            }
        }
        for (; viewIndex < viewNodesLength; viewIndex++)
            addNodes.push(this.viewNodes[viewIndex]);
        for (; clientIndex < this.clientNodes.length; clientIndex++) {
            const node = this.clientNodes[clientIndex];
            if (node.isRemoved) eatNodes.push(node);
            else if (node.owner != this) delNodes.push(node);
            else {
                updNodes.push(node);
                this.viewNodes.push(node);
            }
        }
        this.clientNodes = this.viewNodes;
        client.sendPacket(new Packet.UpdateNodes(this, addNodes, updNodes, eatNodes, delNodes));
        if (++this.tickLeaderboard > 25) { // 1 / 0.040 = 25 (once per second)
            this.tickLeaderboard = 0;
            if (this.server.leaderboardType >= 0)
                client.sendPacket(new Packet.UpdateLeaderboard(this, this.server.leaderboard, this.server.leaderboardType));
        }
    }
    updateView(len) {
        if (len) { // in game
            if (len) this.centerPos = this.cells.reduce(
                (average, current) => average.add(current.position),
                new Vec2(0, 0)
            ).divide(len);
            this._scale = this.getLivingScale();
        } else if (this.spectate) {
            let player = this.getSpecTarget();
            if (player && !this.freeRoam) {
                this.setCenterPos(player.centerPos);
                this._scale = player.getLivingScale();
                this.place = player.place;
                this.viewBox = player.viewBox;
                this.viewNodes = player.viewNodes;
            } else {
                // free roam
                var mouseVec = this.mouse.difference(this.centerPos);
                var mouseDist = mouseVec.dist();
                if (mouseDist != 0)
                    this.setCenterPos(this.centerPos.add(mouseVec.product(32 / mouseDist)));
                this._scale = this.server.config.serverSpectatorScale;
            }
        }
    }
    split() {
        if (this.spectate) {
            // Check for spam first (to prevent too many add/del updates)
            if (this.server.ticks - this.lastKeypressTick < 40) return;
            this.lastKeypressTick = this.server.ticks;
            // Space doesn't work for freeRoam mode
            if (this.freeRoam || this.server.largestClient == null) return;
        } else if (this.server.run) {
            // Disable mergeOverride on the last merging cell
            if (this.cells.length <= 2) this.mergeOverride = false;
            // Cant split if merging or frozen
            if (this.mergeOverride || this.frozen) return;
            this.server.splitCells(this);
        }
    }
    eject() {
        if (this.spectate || !this.server.run) return;
        this.server.ejectMass(this);
    }
    spectateToggle() {
        if (this.spectate) {
            // Check for spam first (to prevent too many add/del updates)
            if (this.server.ticks - this.lastKeypressTick < 40) return;
            this.lastKeypressTick = this.server.ticks;
            this.freeRoam = !this.freeRoam;
        }
    }
    getSpecTarget() {
        if (this.spectateTarget?.isRemoved) this.spectateTarget = null;
        return this.spectateTarget ?? this.server.largestClient;
    }
    setCenterPos(p) {
        p.x = Math.max(p.x, this.server.border.minx);
        p.y = Math.max(p.y, this.server.border.miny);
        p.x = Math.min(p.x, this.server.border.maxx);
        p.y = Math.min(p.y, this.server.border.maxy);
        this.centerPos = p;
    }
}

module.exports = Player;

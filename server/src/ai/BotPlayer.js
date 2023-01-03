const Player = require('../Player');
const Vec2 = require('../modules/Vec2');

const decideTypes = [
    function decidePlayer(node, cell) {
        // Same team, don't eat
        if (this.server.mode.haveTeams && cell.owner.team == node.owner.team)
            return 0;
        if (cell.radius > node.radius * 1.15) // Edible
            return node.radius * 2.5;
        if (node.radius > cell.radius * 1.15) // Bigger, avoid
            return -node.radius;
        return -(node.radius / cell.radius) / 3;
    },
    function decideFood(node, cell) { // Always edible
        return 1;
    },
    function decideEjected(node, cell) {
        return (cell.radius > node.radius * 1.15) ? node.radius : 0;
    },
    function decideVirus(node, cell) {
        if (cell.radius > node.radius * 1.15) { // Edible
            if (this.cells.length == this.server.config.playerMaxCells) {
                // Reached cell limit, won't explode
                return node.radius * 2.5;
            }
            // Will explode, avoid
            return -1;
        }
        // Avoid mother cell if bigger than player
        return (node.isMotherCell && node.radius > cell.radius * 1.15) ? -1 : 0;
    }
];

class BotPlayer extends Player {
    constructor(server, socket) {
        super(server, socket);
        this.isBot = true;
        this.splitCooldown = 0;
    }
    largest(list) {
        return list.reduce((largest, current) =>
            current.radius > largest.radius ? current : largest);
    }
    checkConnection() {
        // Respawn if bot is dead
        if (!this.cells.length)
            this.server.mode.onPlayerSpawn(this.server, this);
    }
    sendUpdate() {
        if (this.splitCooldown) --this.splitCooldown;
        this.decide(this.largest(this.cells));
    }
    decide(cell) {
        if (!cell) return;
        const result = new Vec2(0, 0);
        for (const node of this.viewNodes) {
            if (node.owner == this) continue;

            // Make decisions
            let influence = decideTypes[node.type].call(this, node, cell);

            // Conclude decisions
            // Apply influence if it isn't 0
            if (influence == 0) continue;

            // Calculate separation between cell and node
            const displacement = node.position.difference(cell.position);

            // Figure out distance between cells
            let distance = displacement.dist();

            if (influence < 0)
                distance -= cell.radius + node.radius; // Get edge distance

            // The farther they are the smaller influence it is
            if (distance < 1) distance = 1;
            influence /= distance;

            // Splitting conditions
            if (node.type != 1 && cell.radius > node.radius * 1.15 &&
                !this.splitCooldown && this.cells.length < 8 &&
                400 - cell.radius / 2 - node.radius >= distance)
            {
                // Splitkill the target
                this.splitCooldown = 15;
                this.mouse.assign(node.position);
                this.socket.client.splitRequested = true;
                return;
            } else {
                // Produce force vector exerted by this entity on the cell
                result.add(displacement.normalize().product(influence));
            }
        }
        this.mouse.assign(cell.position.sum(result.multiply(900)));
    }
}
module.exports = BotPlayer;

const Vec2 = require('../modules/Vec2');

class Cell {
    constructor(server, owner, position, size) {
        this.server = server;
        this.owner = owner; // Client that owns this cell
        this.color = { r: 0, g: 0, b: 0 };
        this._radius2 = 0;
        this.radius = 0;
        this._mass = 0;
        this.type = -1; // 0 = Player Cell, 1 = Food, 2 = Virus, 3 = Ejected Mass
        this.isVirus = false; // If true, then this cell has spikes around it
        this.isAgitated = false; // If true, then this cell has waves on it's outline
        this.killer = null; // Cell that ate this cell
        this.isMoving = false; // Indicate that cell is in boosted mode
        this.boostDistance = 0;
        this.boostDirection = new Vec2(0, 0);

        if (this.server) {
            this.createdAt = this.server.ticks;
            this.nodeId = this.server.lastNodeId++ >> 0;
            if (size)
                this.setSize(size);
            if (position)
                this.position = position.clone();
        }
    }
    // Fields not defined by the constructor are considered private and need a getter/setter to access from a different class
    setSize(size) {
        this.radius = size;
        this._radius2 = size * size;
        this._mass = this._radius2 / 100;
    }
    // By default cell cannot eat anyone
    canEat(cell) {
        return false;
    }
    // Returns cell age in ticks for specified game tick
    getAge() {
        return this.server.ticks - this.createdAt;
    }
    // Called to eat prey cell
    onEat(prey) {
        if (!this.server.config.playerBotGrow) {
            if (this.radius >= 250 && prey.radius <= 41 && prey.type == 0)
                prey._radius2 = 0; // Can't grow from players under 17 mass
        }
        return this.setSize(Math.sqrt(this._radius2 + prey._radius2));
    }
    // Boost cell
    setBoost(distance, angle) {
        this.boostDistance = distance;
        this.boostDirection = Vec2.fromAngle(angle);
        this.isMoving = true;
        if (!this.owner) {
            const index = this.server.movingNodes.indexOf(this);
            if (index < 0)
                this.server.movingNodes.push(this);
        }
    }
    // Prevent cell from crossing the border
    checkBorder(b) {
        const r = this.radius / 2;
        if (this.position.x < b.minx + r || this.position.x > b.maxx - r) {
            this.boostDirection.x *= -1; // Reflect left-right
            this.position.x = Math.max(this.position.x, b.minx + r);
            this.position.x = Math.min(this.position.x, b.maxx - r);
        }
        if (this.position.y < b.miny + r || this.position.y > b.maxy - r) {
            this.boostDirection.y *= -1; // Reflect off of top and bottom, borders
            this.position.y = Math.max(this.position.y, b.miny + r);
            this.position.y = Math.min(this.position.y, b.maxy - r);
        }
    }

    // Misc event functions
    onEaten(hunter) {}
    onAdd(server) {}
    onRemove(server) {}
}

module.exports = Cell;

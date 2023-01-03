const Cell = require('./Cell');

class Food extends Cell {
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.type = 1;
        this.overrideReuse = false;
    }
    onAdd(server) {
        server.nodesFood.push(this);
    }
    onRemove(server) {
        server.nodesFood.removeUnsorted(this);
        if (!this.overrideReuse) server.spawnFood();
    }
}

module.exports = Food;

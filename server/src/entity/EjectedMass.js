const Cell = require('./Cell');

class EjectedMass extends Cell {
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.type = 3;
    }
    onAdd(server) {
        server.nodesEjected.push(this);
    }
    onRemove(server) {
        server.nodesEjected.removeUnsorted(this);
    }
}

module.exports = EjectedMass;

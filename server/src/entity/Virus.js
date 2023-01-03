const Cell = require('./Cell');

class Virus extends Cell {
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.type = 2;
        this.isVirus = true;
        this.isMotherCell = false; // Not to confuse bots
        this.color = {
            r: 0,
            g: 0,
            b: 0
        };
    }
    // Main Functions
    canEat(cell) {
        // cannot eat if virusMaxAmount is reached
        if (this.server.nodesVirus.length < this.server.config.virusMaxAmount)
            return cell.type == 3; // virus can eat ejected mass only
    }
    onEat(prey) {
        // Called to eat prey cell
        this.setSize(Math.sqrt(this._radius2 + prey._radius2));
        if (this.radius >= this.server.config.virusMaxSize) {
            this.setSize(this.server.config.virusMinSize); // Reset mass
            this.server.shootVirus(this, prey.boostDirection.angle());
        }
    }
    onEaten(cell) {
        if (!cell.owner)
            return;
        var config = this.server.config;
        var cellsLeft = (config.virusMaxCells || config.playerMaxCells) - cell.owner.cells.length;
        if (cellsLeft <= 0)
            return;
        var splitMin = config.virusMaxPoppedSize * config.virusMaxPoppedSize / 100;
        var cellMass = cell._mass, splits = [], splitCount, splitMass;
        if (config.virusEqualPopSize) {
            // definite monotone splits
            splitCount = Math.min(~~(cellMass / splitMin), cellsLeft);
            splitMass = cellMass / (1 + splitCount);
            for (var i = 0; i < splitCount; i++)
                splits.push(splitMass);
            return this.explodeCell(cell, splits);
        }
        if (cellMass / cellsLeft < splitMin) {
            // powers of 2 monotone splits
            splitCount = 2;
            splitMass = cellMass / splitCount;
            while (splitMass > splitMin && splitCount * 2 < cellsLeft)
                splitMass = cellMass / (splitCount *= 2);
            splitMass = cellMass / (splitCount + 1);
            while (splitCount-- > 0)
                splits.push(splitMass);
            return this.explodeCell(cell, splits);
        }
        // half-half splits
        var splitMass = cellMass / 2;
        var massLeft = cellMass / 2;
        while (cellsLeft-- > 0) {
            if (massLeft / cellsLeft < splitMin) {
                splitMass = massLeft / cellsLeft;
                while (cellsLeft-- > 0)
                    splits.push(splitMass);
            }
            while (splitMass >= massLeft && cellsLeft > 0)
                splitMass /= 2;
            splits.push(splitMass);
            massLeft -= splitMass;
        }
        this.explodeCell(cell, splits);
    }
    explodeCell(cell, splits) {
        for (var i = 0; i < splits.length; i++)
            this.server.splitPlayerCell(cell.owner, cell, 2 * Math.PI * Math.random(), splits[i]);
    }
    onAdd(server) {
        server.nodesVirus.push(this);
    }
    onRemove(server) {
        server.nodesVirus.removeUnsorted(this);
        server.spawnVirus();
    }
}

module.exports = Virus;
Virus.prototype = new Cell();

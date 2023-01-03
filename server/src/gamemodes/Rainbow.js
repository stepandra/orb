const FFA = require('./FFA'); // Base gamemode

class Rainbow extends FFA{
    constructor() {
        super();
        this.ID = 3;
        this.name = "Rainbow FFA";
        this.specByLeaderboard = true;
        this.speed = 1; // Speed of color change
        this.colors = [
            { 'r': 255, 'g': 0, 'b': 0 },
            { 'r': 255, 'g': 32, 'b': 0 },
            { 'r': 255, 'g': 64, 'b': 0 },
            { 'r': 255, 'g': 96, 'b': 0 },
            { 'r': 255, 'g': 128, 'b': 0 },
            { 'r': 255, 'g': 160, 'b': 0 },
            { 'r': 255, 'g': 192, 'b': 0 },
            { 'r': 255, 'g': 224, 'b': 0 },
            { 'r': 255, 'g': 255, 'b': 0 },
            { 'r': 192, 'g': 255, 'b': 0 },
            { 'r': 128, 'g': 255, 'b': 0 },
            { 'r': 64, 'g': 255, 'b': 0 },
            { 'r': 0, 'g': 255, 'b': 0 },
            { 'r': 0, 'g': 192, 'b': 64 },
            { 'r': 0, 'g': 128, 'b': 128 },
            { 'r': 0, 'g': 64, 'b': 192 },
            { 'r': 0, 'g': 0, 'b': 255 },
            { 'r': 18, 'g': 0, 'b': 192 },
            { 'r': 37, 'g': 0, 'b': 128 },
            { 'r': 56, 'g': 0, 'b': 64 },
            { 'r': 75, 'g': 0, 'b': 130 },
            { 'r': 92, 'g': 0, 'b': 161 },
            { 'r': 109, 'g': 0, 'b': 192 },
            { 'r': 126, 'g': 0, 'b': 223 },
            { 'r': 143, 'g': 0, 'b': 255 },
            { 'r': 171, 'g': 0, 'b': 192 },
            { 'r': 199, 'g': 0, 'b': 128 },
            { 'r': 227, 'g': 0, 'b': 64 },
        ];
    }
    // Gamemode Specific Functions
    changeColor(node, server) {
        node.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    // Override
    onServerInit() { }
    onTick(server) {
        // Change color
        for (const node of server.nodes) {
            if (!node) continue;
            this.changeColor(node, server);
        }
    }
}

module.exports = Rainbow;
Rainbow.prototype = new FFA();

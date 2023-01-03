const BinaryWriter = require("./BinaryWriter");

class UpdatePosition {
    constructor(player, x, y, scale) {
        this.player = player,
            this.x = x;
        this.y = y;
        this.scale = scale;
    }
    build(protocol) {
        var writer = new BinaryWriter();
        writer.writeUInt8(0x11);
        writer.writeFloat(this.x + this.player.scrambleX);
        writer.writeFloat(this.y + this.player.scrambleY);
        writer.writeFloat(this.scale);
        return writer.toBuffer();
    }
}

module.exports = UpdatePosition;

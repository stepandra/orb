const BinaryWriter = require('./BinaryWriter');

class LeaderboardPosition {
    constructor(position) {
        this.place = position;
    }
    build() {
        var buf = new BinaryWriter();
        buf.writeUInt8(0x30);
        buf.writeUInt16(this.place);
        return buf.toBuffer();
    }
}

module.exports = LeaderboardPosition;

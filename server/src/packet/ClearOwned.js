const BinaryWriter = require("./BinaryWriter");

class ClearOwned {
    constructor() { }
    build(protocol) {
        var writer = new BinaryWriter();
        writer.writeUInt8(0x14);
        return writer.toBuffer();
    }
}

module.exports = ClearOwned;

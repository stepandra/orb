const BinaryWriter = require("./BinaryWriter");

class UpdateNodes {
    constructor(player, addNodes, updNodes, eatNodes, delNodes) {
        this.player = player;
        this.addNodes = addNodes;
        this.updNodes = updNodes;
        this.eatNodes = eatNodes;
        this.delNodes = delNodes;
    }
    build(protocol) {
        if (!protocol)
            return null;
        var writer = new BinaryWriter();
        writer.writeUInt8(0x10); // Packet ID
        this.writeEatItems(writer);
        if (protocol < 5)
            this.writeUpdateItems4(writer);
        else if (protocol == 5)
            this.writeUpdateItems5(writer);
        else if (protocol < 11)
            this.writeUpdateItems6(writer);
        else
            this.writeUpdateItems11(writer);
        this.writeRemoveItems(writer, protocol);
        return writer.toBuffer();
    }
    // protocol 4
    writeUpdateItems4(writer) {
        var scrambleX = this.player.scrambleX;
        var scrambleY = this.player.scrambleY;
        var scrambleId = this.player.scrambleId;
        for (var i = 0; i < this.updNodes.length; i++) {
            var node = this.updNodes[i];
            if (node.nodeId == 0)
                continue;
            var cellX = node.position.x + scrambleX;
            var cellY = node.position.y + scrambleY;
            // Write update record
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Cell ID
            writer.writeUInt16(cellX >> 0); // Coordinate X
            writer.writeUInt16(cellY >> 0); // Coordinate Y
            writer.writeUInt16(node.radius >>> 0); // Cell Size (not to be confused with mass, because mass = size*size/100)
            var color = node.color;
            writer.writeUInt8(color.r >>> 0); // Color R
            writer.writeUInt8(color.g >>> 0); // Color G
            writer.writeUInt8(color.b >>> 0); // Color B
            var flags = 0;
            if (node.isVirus)
                flags |= 0x01; // isVirus
            if (node.isAgitated)
                flags |= 0x10; // isAgitated
            if (node.type == 3)
                flags |= 0x20; // isEjected
            writer.writeUInt8(flags >>> 0); // Flags
            writer.writeUInt16(0); // Name
        }
        for (var i = 0; i < this.addNodes.length; i++) {
            var node = this.addNodes[i];
            if (node.nodeId == 0)
                continue;
            var cellX = node.position.x + scrambleX;
            var cellY = node.position.y + scrambleY;
            var cellName = null;
            if (node.owner) {
                cellName = node.owner._nameUnicode;
            }
            // Write update record
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Cell ID
            writer.writeUInt16(cellX >> 0); // Coordinate X
            writer.writeUInt16(cellY >> 0); // Coordinate Y
            writer.writeUInt16(node.radius >>> 0); // Cell Size (not to be confused with mass, because mass = size*size/100)
            var color = node.color;
            writer.writeUInt8(color.r >>> 0); // Color R
            writer.writeUInt8(color.g >>> 0); // Color G
            writer.writeUInt8(color.b >>> 0); // Color B
            var flags = 0;
            if (node.isVirus)
                flags |= 0x01; // isVirus
            if (node.isAgitated)
                flags |= 0x10; // isAgitated
            if (node.type == 3)
                flags |= 0x20; // isEjected
            writer.writeUInt8(flags >>> 0); // Flags
            if (cellName != null)
                writer.writeBytes(cellName); // Name
            else
                writer.writeUInt16(0); // Name
        }
        writer.writeUInt32(0); // Cell Update record terminator
    }
    // protocol 5
    writeUpdateItems5(writer) {
        var scrambleX = this.player.scrambleX;
        var scrambleY = this.player.scrambleY;
        var scrambleId = this.player.scrambleId;
        for (var i = 0; i < this.updNodes.length; i++) {
            var node = this.updNodes[i];
            if (node.nodeId == 0)
                continue;
            var cellX = node.position.x + scrambleX;
            var cellY = node.position.y + scrambleY;
            // Write update record
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Cell ID
            writer.writeUInt32(cellX >> 0); // Coordinate X
            writer.writeUInt32(cellY >> 0); // Coordinate Y
            writer.writeUInt16(node.radius >>> 0); // Cell Size (not to be confused with mass, because mass = size*size/100)
            var color = node.color;
            writer.writeUInt8(color.r >>> 0); // Color R
            writer.writeUInt8(color.g >>> 0); // Color G
            writer.writeUInt8(color.b >>> 0); // Color B
            var flags = 0;
            if (node.isVirus)
                flags |= 0x01; // isVirus
            if (node.isAgitated)
                flags |= 0x10; // isAgitated
            if (node.type == 3)
                flags |= 0x20; // isEjected
            writer.writeUInt8(flags >>> 0); // Flags
            writer.writeUInt16(0); // Cell Name
        }
        for (var i = 0; i < this.addNodes.length; i++) {
            var node = this.addNodes[i];
            if (node.nodeId == 0)
                continue;
            var cellX = node.position.x + scrambleX;
            var cellY = node.position.y + scrambleY;
            var skinName = null;
            var cellName = null;
            if (node.owner) {
                skinName = node.owner._skinUtf8;
                cellName = node.owner._nameUnicode;
            }
            // Write update record
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Cell ID
            writer.writeUInt32(cellX >> 0); // Coordinate X
            writer.writeUInt32(cellY >> 0); // Coordinate Y
            writer.writeUInt16(node.radius >>> 0); // Cell Size (not to be confused with mass, because mass = size*size/100)
            var color = node.color;
            writer.writeUInt8(color.r >>> 0); // Color R
            writer.writeUInt8(color.g >>> 0); // Color G
            writer.writeUInt8(color.b >>> 0); // Color B
            var flags = 0;
            if (node.isVirus)
                flags |= 0x01; // isVirus
            if (skinName != null)
                flags |= 0x04; // isSkinPresent
            if (node.isAgitated)
                flags |= 0x10; // isAgitated
            if (node.type == 3)
                flags |= 0x20; // isEjected
            writer.writeUInt8(flags >>> 0); // Flags
            if (flags & 0x04)
                writer.writeBytes(skinName); // Skin Name in UTF8
            if (cellName != null)
                writer.writeBytes(cellName); // Name
            else
                writer.writeUInt16(0); // Name
        }
        writer.writeUInt32(0 >> 0); // Cell Update record terminator
    }
    // protocol 6
    writeUpdateItems6(writer) {
        var scrambleX = this.player.scrambleX;
        var scrambleY = this.player.scrambleY;
        var scrambleId = this.player.scrambleId;
        for (var i = 0; i < this.updNodes.length; i++) {
            var node = this.updNodes[i];
            if (node.nodeId == 0)
                continue;
            var cellX = node.position.x + scrambleX;
            var cellY = node.position.y + scrambleY;
            // Write update record
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Cell ID
            writer.writeUInt32(cellX >> 0); // Coordinate X
            writer.writeUInt32(cellY >> 0); // Coordinate Y
            writer.writeUInt16(node.radius >>> 0); // Cell Size (not to be confused with mass, because mass = size*size/100)
            var flags = 0;
            if (node.isVirus)
                flags |= 0x01; // isVirus
            if (node.type == 0)
                flags |= 0x02; // isColorPresent (for players only)
            if (node.isAgitated)
                flags |= 0x10; // isAgitated
            if (node.type == 3)
                flags |= 0x20; // isEjected
            writer.writeUInt8(flags >>> 0); // Flags
            if (flags & 0x02) {
                var color = node.color;
                writer.writeUInt8(color.r >>> 0); // Color R
                writer.writeUInt8(color.g >>> 0); // Color G
                writer.writeUInt8(color.b >>> 0); // Color B
            }
        }
        for (var i = 0; i < this.addNodes.length; i++) {
            var node = this.addNodes[i];
            if (node.nodeId == 0)
                continue;
            var cellX = node.position.x + scrambleX;
            var cellY = node.position.y + scrambleY;
            var skinName = null;
            var cellName = null;
            if (node.owner) {
                skinName = node.owner._skinUtf8;
                cellName = node.owner._nameUtf8;
            }
            // Write update record
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Cell ID
            writer.writeUInt32(cellX >> 0); // Coordinate X
            writer.writeUInt32(cellY >> 0); // Coordinate Y
            writer.writeUInt16(node.radius >>> 0); // Cell Size (not to be confused with mass, because mass = size*size/100)
            var flags = 0;
            if (node.isVirus)
                flags |= 0x01; // isVirus
            if (true)
                flags |= 0x02; // isColorPresent (always for added)
            if (skinName != null)
                flags |= 0x04; // isSkinPresent
            if (cellName != null)
                flags |= 0x08; // isNamePresent
            if (node.isAgitated)
                flags |= 0x10; // isAgitated
            if (node.type == 3)
                flags |= 0x20; // isEjected
            writer.writeUInt8(flags >>> 0); // Flags
            if (flags & 0x02) {
                var color = node.color;
                writer.writeUInt8(color.r >>> 0); // Color R
                writer.writeUInt8(color.g >>> 0); // Color G
                writer.writeUInt8(color.b >>> 0); // Color B
            }
            if (flags & 0x04)
                writer.writeBytes(skinName); // Skin Name in UTF8
            if (flags & 0x08)
                writer.writeBytes(cellName); // Cell Name in UTF8
        }
        writer.writeUInt32(0); // Cell Update record terminator
    }
    // protocol 11
    writeUpdateItems11(writer) {
        var scrambleX = this.player.scrambleX;
        var scrambleY = this.player.scrambleY;
        var scrambleId = this.player.scrambleId;
        for (var i = 0; i < this.updNodes.length; i++) {
            var node = this.updNodes[i];
            if (node.nodeId == 0)
                continue;
            var cellX = node.position.x + scrambleX;
            var cellY = node.position.y + scrambleY;
            // Write update record
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Cell ID
            writer.writeUInt32(cellX >> 0); // Coordinate X
            writer.writeUInt32(cellY >> 0); // Coordinate Y
            writer.writeUInt16(node.radius >>> 0); // Cell Size (not to be confused with mass, because mass = size*size/100)
            var flags = 0;
            if (node.isVirus)
                flags |= 0x01; // isVirus
            if (node.type == 0)
                flags |= 0x02; // isColorPresent (for players only)
            if (node.isAgitated)
                flags |= 0x10; // isAgitated
            if (node.type == 3)
                flags |= 0x20; // isEjected
            if (node.type == 1)
                flags |= 0x80; // isFood
            writer.writeUInt8(flags >>> 0); // Flags
            if (flags & 0x80)
                writer.writeUInt8(0x01);
            if (flags & 0x02) {
                var color = node.color;
                writer.writeUInt8(color.r >>> 0); // Color R
                writer.writeUInt8(color.g >>> 0); // Color G
                writer.writeUInt8(color.b >>> 0); // Color B
            }
        }
        for (var i = 0; i < this.addNodes.length; i++) {
            var node = this.addNodes[i];
            if (node.nodeId == 0)
                continue;
            var cellX = node.position.x + scrambleX;
            var cellY = node.position.y + scrambleY;
            var skinName = null;
            var cellName = null;
            if (node.owner) {
                skinName = node.owner._skinUtf8protocol11;
                cellName = node.owner._nameUtf8;
            }
            // Write update record
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Cell ID
            writer.writeUInt32(cellX >> 0); // Coordinate X
            writer.writeUInt32(cellY >> 0); // Coordinate Y
            writer.writeUInt16(node.radius >>> 0); // Cell Size (not to be confused with mass, because mass = size*size/100)
            var flags = 0;
            if (node.isVirus)
                flags |= 0x01; // isVirus
            if (true)
                flags |= 0x02; // isColorPresent (always for added)
            if (skinName != null)
                flags |= 0x04; // isSkinPresent
            if (cellName != null)
                flags |= 0x08; // isNamePresent
            if (node.isAgitated)
                flags |= 0x10; // isAgitated
            if (node.type == 3)
                flags |= 0x20; // isEjected
            if (node.type == 1)
                flags |= 0x80; // isFood
            writer.writeUInt8(flags >>> 0); // Flags
            if (flags & 0x80)
                writer.writeUInt8(0x01);
            if (flags & 0x02) {
                var color = node.color;
                writer.writeUInt8(color.r >>> 0); // Color R
                writer.writeUInt8(color.g >>> 0); // Color G
                writer.writeUInt8(color.b >>> 0); // Color B
            }
            if (flags & 0x04)
                writer.writeBytes(skinName); // Skin Name in UTF8
            if (flags & 0x08)
                writer.writeBytes(cellName); // Cell Name in UTF8
        }
        writer.writeUInt32(0); // Cell Update record terminator
    }
    writeEatItems(writer) {
        var scrambleId = this.player.scrambleId;
        writer.writeUInt16(this.eatNodes.length >>> 0); // EatRecordCount
        for (var i = 0; i < this.eatNodes.length; i++) {
            var node = this.eatNodes[i];
            var hunterId = 0;
            if (node.killer) {
                hunterId = node.killer.nodeId;
            }
            writer.writeUInt32((hunterId ^ scrambleId) >>> 0); // Hunter ID
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Prey ID
        }
    }
    writeRemoveItems(writer, protocol) {
        var scrambleId = this.player.scrambleId;
        var length = this.eatNodes.length + this.delNodes.length;
        if (protocol < 6)
            writer.writeUInt32(length >>> 0); // RemoveRecordCount
        else
            writer.writeUInt16(length >>> 0); // RemoveRecordCount
        for (var i = 0; i < this.eatNodes.length; i++) {
            var node = this.eatNodes[i];
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Cell ID
        }
        for (var i = 0; i < this.delNodes.length; i++) {
            var node = this.delNodes[i];
            writer.writeUInt32((node.nodeId ^ scrambleId) >>> 0); // Cell ID
        }
    }
}

module.exports = UpdateNodes;

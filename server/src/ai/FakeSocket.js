class FakeSocket {
    constructor(server) {
        this.server = server;
        this.isCloseRequest = false;
        this.isConnected = true;
    }
    sendPacket(packet) {
        return;
    }
    close() {
        this.isCloseRequest = true;
        this.isConnected = false;
    }
}

module.exports = FakeSocket;

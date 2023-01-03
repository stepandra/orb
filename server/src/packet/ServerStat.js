const BinaryWriter = require("./BinaryWriter");

class ServerStat {
    constructor(player) {
        this.player = player;
    }
    build(protocol) {
        let server = this.player.server;
        if (!server.statsObj) server.getStats();
        if (Date.now() - server.statsObj.stats_time > 5e3) server.getStats();
        let stats = server.statsObj;
        let obj = {
            'name': server.config.serverName,
            'mode': server.mode.name,
            'uptime': Math.round((server.stepDateTime - server.startTime) / 1000),
            'update': server.updateTimeAvg.toFixed(3),
            'playersTotal': stats.current_players + stats.bots,
            'playersAlive': stats.alive + stats.bots,
            'playersSpect': stats.spectators,
            'playersLimit': server.config.serverMaxConnections,
            'leaderboard': stats.leaderboard
        };
        var json = JSON.stringify(obj);
        // Serialize
        var writer = new BinaryWriter();
        writer.writeUInt8(254); // Message Id
        writer.writeStringZeroUtf8(json); // JSON
        return writer.toBuffer();
    }
}

module.exports = ServerStat;

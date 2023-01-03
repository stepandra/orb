// External modules.
const ReadLine = require("readline");

const addToProto = (obj, name, func) => {
    if (!obj.prototype[name]) obj.prototype[name] = func;
};
addToProto(Array, "removeSorted", function(item) {
    const index = this.indexOf(item);
    if (index != -1) this.splice(index, 1);
    return this;
});
addToProto(Array, "removeUnsorted", function(item, index = this.indexOf(item)) {
    if (index == this.length - 1) this.pop();
    else if (index != -1) this[index] = this.pop();
    return this;
});

// Project modules.
const Commands = require("./modules/CommandList.js");
const Server = require("./Server.js");
const Logger = require("./modules/Logger.js");

// Create console interface.
const inputInterface = ReadLine.createInterface(process.stdin, process.stdout);

// Create and start instance of server.
const instance = new Server();
instance.start();

// Welcome message.
Logger.info(`Running MultiOgarII ${instance.version}, a FOSS agar.io server implementation.`);

// Catch console input.
inputInterface.on("line", (input) => {
    const args = input.toLowerCase().split(" ");
    if(Commands[args[0]]) Commands[args[0]](instance, args);
});

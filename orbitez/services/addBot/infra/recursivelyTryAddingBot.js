import requestAddingBot from "./requestAddingBot";

const recursivelyTryAddingBot = (bots, serverName) => {
    return new Promise(async (resolve, reject) => {
        const bot = bots.pop();

        try {
            const hash = await requestAddingBot(bot, serverName);
            resolve(hash);
        } catch (error) {
            if (bots.length === 0) {
                reject(error);
                return;
            }

            try {
                const hash = await recursivelyTryAddingBot(bots, serverName);
                resolve(hash);
            } catch (err) {
                reject(err);
            }
        }
    });
};

export default recursivelyTryAddingBot;

import recursivelyTryAddingBot from "@services/addBot/infra/recursivelyTryAddingBot";
import requestAddingBot from "@services/addBot/infra/requestAddingBot";

jest.mock("@services/addBot/infra/requestAddingBot", () => jest.fn());

afterEach(() => {
    requestAddingBot.mockReset();
});

describe("recursivelyTryAddingBot() function", () => {
    it("requests the addition of the last bot from the array and resolves with a hash", async () => {
        const botsArray = ["bot1", "bot2", "bot3", "bot4", "bot5"];
        const serverName = "Orbitez-main-FRA";

        requestAddingBot.mockResolvedValueOnce("hash");

        const operationHash = await recursivelyTryAddingBot(
            botsArray,
            serverName
        );
        expect(operationHash).toBe("hash");
        expect(requestAddingBot).toBeCalledTimes(1);
        expect(requestAddingBot).toBeCalledWith("bot5", serverName);
    });

    it("requests the addition of the second bot, when the addition of the first one was unsuccessful and resolves with a hash", async () => {
        const botsArray = ["bot1", "bot2", "bot3", "bot4", "bot5"];
        const serverName = "Orbitez-main-FRA";

        requestAddingBot.mockRejectedValueOnce(new Error());
        requestAddingBot.mockResolvedValueOnce("hash");

        const operationHash = await recursivelyTryAddingBot(
            botsArray,
            serverName
        );
        expect(operationHash).toBe("hash");
        expect(requestAddingBot).toBeCalledTimes(2);
        expect(requestAddingBot).toHaveBeenLastCalledWith("bot4", serverName);
    });

    it("requests the addition of the fifth bot, when the addition of the previous four was unsuccessful and resolves with a hash", async () => {
        const botsArray = ["bot1", "bot2", "bot3", "bot4", "bot5"];
        const serverName = "Orbitez-main-FRA";

        for (let i = 0; i < 4; i++) {
            requestAddingBot.mockRejectedValueOnce(new Error());
        }
        requestAddingBot.mockResolvedValueOnce("hash");

        const operationHash = await recursivelyTryAddingBot(
            botsArray,
            serverName
        );
        expect(operationHash).toBe("hash");
        expect(requestAddingBot).toBeCalledTimes(5);
        expect(requestAddingBot).toHaveBeenLastCalledWith("bot1", serverName);
    });

    it("rejects with an error if the addition of all bots was unsuccessful", async () => {
        const botsArray = ["bot1", "bot2", "bot3", "bot4", "bot5"];
        const serverName = "Orbitez-main-FRA";

        // Calling "forEach" in the reverse order, since bots are removed from the array using .pop()
        botsArray.reduceRight((_, bot) => {
            requestAddingBot.mockRejectedValueOnce(new Error(`${bot} failed`));
        }, null);
        requestAddingBot.mockResolvedValueOnce("hash");

        expect.assertions(3);

        try {
            await recursivelyTryAddingBot(botsArray, serverName);
        } catch (error) {
            expect(error.message).toBe("bot1 failed");
        }

        expect(requestAddingBot).toBeCalledTimes(5);
        expect(requestAddingBot).toHaveBeenLastCalledWith("bot1", serverName);
    });
});

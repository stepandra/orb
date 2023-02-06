import { signerFactory } from "@utils/tezosUtils";
import { CONTRACT_ADDRESS, RPC_URL } from "../../../constants";
import pendingBotTransactions from "./PendingBotTransactions";

const requestAddingBot = (bot, serverName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const Tezos = await signerFactory(RPC_URL, bot.privateKey);

            const contract = await Tezos.contract.at(CONTRACT_ADDRESS);

            const operation = await contract.methods
                .enter_room(serverName, serverName)
                .send({ amount: 1 });
            
            const { hash } = operation;
            pendingBotTransactions.pushTransaction(serverName, hash);

            await operation.confirmation().then(() => {
                pendingBotTransactions.removeTransaction(serverName);
                resolve(hash);
            });
        } catch (error) {
            reject(error);
        }
    });
};

export default requestAddingBot;
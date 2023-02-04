import { signerFactory } from "@utils/tezosUtils";
import { CONTRACT_ADDRESS } from "../../../constants";

const requestAddingBot = (bot, serverName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const Tezos = await signerFactory(bot.privateKey);

            const contract = await Tezos.contract.at(CONTRACT_ADDRESS);

            const operation = await contract.methods
                .enter_room(serverName, serverName)
                .send({ amount: 1 });

            const hash = await operation.confirmation(3);

            resolve(hash);
        } catch (error) {
            reject(error);
        }
    });
};

export default requestAddingBot;
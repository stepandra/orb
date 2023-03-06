import axios from 'axios';
import { BASE_TZKT_API_URL } from '../../../constants';

class PendingBotTransactions {
    constructor() {
        this.serverTransactionsMap = new Map();
    }

    setTransaction(serverName, transactionHash) {
        this.serverTransactionsMap.set(serverName, transactionHash);
    };

    removeTransaction(serverName) {
        this.serverTransactionsMap.delete(serverName);
    };

    isThereAPendingTransaction(serverName) {
        return this.serverTransactionsMap.has(serverName);
    };

    async isPendingTransactionConfirmed(serverName) {
        if(!this.serverTransactionsMap.has(serverName)) {
            throw new Error("No pending bot transaction for this server");
        };

        const transactionHash = this.serverTransactionsMap.get(serverName);

        const { data: isConfirmed } = await axios({
            method: "GET",
            url: `/operations/transactions/${transactionHash}/status`,
            baseURL: BASE_TZKT_API_URL,
        });

        if (isConfirmed) {
            this.removeTransaction(serverName);
            return true;
        } else {
            return false;
        };
    };
};

const pendingBotTransactions = new PendingBotTransactions();
export default pendingBotTransactions;

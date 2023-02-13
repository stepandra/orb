export const RPC_URL = 'https://rpc.tzkt.io/ghostnet'
export const BASE_TZKT_API_URL = 'https://api.ghostnet.tzkt.io/v1';
export const CONTRACT_ADDRESS = 'KT1WEVRHFcRq8n9iefMNm2s9P2gbB1d5gVzH'
export const NFT_ADDRESS = 'KT1QUPuQYpqmfUZ7MtE9AhJ11n7ce1mKyyMB'
export const NFT_CONTRACT_ADDRESS = 'KT1AEVuykWeuuFX7QkEAMNtffzwhe1Z98hJS'

export const MIN_BOT_JOIN_TIME = 120000; // 2 minutes in ms

export const BOTS = [
    {
        address: process.env.BOT_1_ADDRESS,
        privateKey: process.env.BOT_1_PRIVATE_KEY,
    },
    {
        address: process.env.BOT_2_ADDRESS,
        privateKey: process.env.BOT_2_PRIVATE_KEY,
    },
    {
        address: process.env.BOT_3_ADDRESS,
        privateKey: process.env.BOT_3_PRIVATE_KEY,
    },
    {
        address: process.env.BOT_4_ADDRESS,
        privateKey: process.env.BOT_4_PRIVATE_KEY,
    },
    {
        address: process.env.BOT_5_ADDRESS,
        privateKey: process.env.BOT_5_PRIVATE_KEY,
    },
    {
        address: process.env.BOT_6_ADDRESS,
        privateKey: process.env.BOT_6_PRIVATE_KEY,
    },
    {
        address: process.env.BOT_7_ADDRESS,
        privateKey: process.env.BOT_7_PRIVATE_KEY,
    },
];

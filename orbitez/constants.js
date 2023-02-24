export const RPC_URL = 'https://rpc.tzkt.io/ghostnet';
export const BASE_TZKT_API_URL = 'https://api.ghostnet.tzkt.io/v1';
export const CONTRACT_ADDRESS = 'KT1QQnpFLKtUwLDTPofnudfPdmCuBmtmQkrz'
export const NFT_ADDRESS = 'KT1QUPuQYpqmfUZ7MtE9AhJ11n7ce1mKyyMB'
export const NFT_CONTRACT_ADDRESS = 'KT1AEVuykWeuuFX7QkEAMNtffzwhe1Z98hJS'

// Time (in ms) that need to pass before it will be possible to add a bot
// Each value in the array corresponds to the waiting time to add the n-th  ...
// .. bot on a single server 
export const BOT_WAITING_DELAYS = [ 30000, 30000, 30000, 30000, 60000, 90000, 120000 ];

export const BOTS = [
    {
        address: process.env.NEXT_PUBLIC_BOT_1_ADDRESS,
        privateKey: process.env.BOT_1_PRIVATE_KEY,
    },
    {
        address: process.env.NEXT_PUBLIC_BOT_2_ADDRESS,
        privateKey: process.env.BOT_2_PRIVATE_KEY,
    },
    {
        address: process.env.NEXT_PUBLIC_BOT_3_ADDRESS,
        privateKey: process.env.BOT_3_PRIVATE_KEY,
    },
    {
        address: process.env.NEXT_PUBLIC_BOT_4_ADDRESS,
        privateKey: process.env.BOT_4_PRIVATE_KEY,
    },
    {
        address: process.env.NEXT_PUBLIC_BOT_5_ADDRESS,
        privateKey: process.env.BOT_5_PRIVATE_KEY,
    },
    {
        address: process.env.NEXT_PUBLIC_BOT_6_ADDRESS,
        privateKey: process.env.BOT_6_PRIVATE_KEY,
    },
    {
        address: process.env.NEXT_PUBLIC_BOT_7_ADDRESS,
        privateKey: process.env.BOT_7_PRIVATE_KEY,
    },
];

export const IS_STAGING = process.env.NEXT_PUBLIC_IS_STAGING === "true";
export const STAGING_SERVERS = [ "Orbitez-staging-FRA" ];

export const SHOULD_USE_DEV_SERVER = process.env.NEXT_PUBLIC_STAGE === "local";
export const DEV_SERVER = {
    data: {
        isFull: false,
        isGameRunning: false,
        name: "Local-dev-server",
        server_url: "localhost:8080"
    },
    statsServerUrl: "localhost:88",
};

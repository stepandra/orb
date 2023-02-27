export const RPC_URL = 'https://rpc.tzkt.io/ghostnet'
export const BASE_TZKT_API_URL = 'https://api.ghostnet.tzkt.io/v1';
export const CONTRACT_ADDRESS = 'KT1QQnpFLKtUwLDTPofnudfPdmCuBmtmQkrz'
export const NFT_ADDRESS = 'KT1QUPuQYpqmfUZ7MtE9AhJ11n7ce1mKyyMB'
export const NFT_CONTRACT_ADDRESS = 'KT1AEVuykWeuuFX7QkEAMNtffzwhe1Z98hJS'

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

import { TezosToolkit } from "@taquito/taquito";
import { NetworkType } from "@airgap/beacon-sdk";
import { useState, useEffect, useCallback } from "react";
import { useWalletContext } from "@context/WalletContext";
import { MichelCodecPacker } from "@taquito/taquito";

export function useTezos() {
    const wallet = useWalletContext();
    const RPC_URL = "https://rpc.tzkt.io/ghostnet";
    const Tezos = new TezosToolkit(RPC_URL);
    Tezos.setPackerProvider(new MichelCodecPacker());
    Tezos.setWalletProvider(wallet);

    const [balance, setBalance] = useState(0);
    const [address, setAddress] = useState("");
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);

    useEffect(() => {
        const loadAuth = async () => {
            try {
                await connectionExistsCheck();
            } catch (error) {
                console.error(error);
            } finally {
                setIsAuthLoaded(true);
            }
        };

        loadAuth();
    }, []);

    useEffect(() => {
        const updateBalance = async () => {
            if (address === "") return;

            const bal = await Tezos.rpc.getBalance(address);
            setBalance(bal.toNumber() / 1000000);
        };

        updateBalance();
    }, [address]);

    const connectionExistsCheck = useCallback(async () => {
        if (!wallet) return false;

        const activeAccount = await wallet.client.getActiveAccount();

        if (!activeAccount) return false;

        const walletAddress = activeAccount.address;
        console.log(`Already connected: ${walletAddress}`);
        setAddress(walletAddress);
        localStorage.setItem("tzAddress", walletAddress);

        return true;
    }, [wallet]);

    const connectWallet = useCallback(async () => {
        const connectionExists = await connectionExistsCheck();

        if (connectionExists) {
            alert(`Already connected`);
            return;
        };

        await wallet.requestPermissions({
            network: {
                type: NetworkType.GHOSTNET,
                // type: NetworkType.MAINNET,
                rpcUrl: RPC_URL
            }
        });
        const walletAddress = await wallet.getPKH();
        setAddress(walletAddress);
        localStorage.setItem("tzAddress", walletAddress);
    }, [connectionExistsCheck, wallet]);

    const disconnectWallet = useCallback(async () => {
        await wallet.clearActiveAccount();
        setAddress("");
        localStorage.removeItem("tzAddress");
        alert("Disconnected.");
    }, [wallet]);

    return {
        connectWallet,
        disconnectWallet,
        wallet,
        Tezos,
        address,
        balance,
        isAuthLoaded
    };
}

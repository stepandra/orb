import { useState } from "react";
import { BeaconWallet } from "@taquito/beacon-wallet";

class SingletonBeacon {
    constructor() {
        throw "use getInstance";
    }

    static getInstance() {
        if (!SingletonBeacon.instance && typeof window !== "undefined") {
            SingletonBeacon.instance = new BeaconWallet({
                name: "Orbitez",
                preferredNetwork: "ghostnet"
            });
        }
        return SingletonBeacon.instance;
    }
}

const useWallet = () => {
    const [wallet, setWallet] = useState(SingletonBeacon.getInstance());

    return { wallet };
};

export default useWallet;

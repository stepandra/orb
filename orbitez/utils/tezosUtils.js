import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

const signerFactory = async (rpcUrl, privateKey) => {
    const Tezos = new TezosToolkit(rpcUrl);

    Tezos.setProvider({
        signer: await InMemorySigner.fromSecretKey(privateKey),
    });
    return Tezos;
};

export { signerFactory };

import { TezosToolkit } from "@taquito/taquito"
import { NetworkType } from "@airgap/beacon-sdk"
import { useState, useEffect } from 'react'
import { useAppContext } from '../pages/_app'
import { MichelCodecPacker } from '@taquito/taquito';

export function useTezos() {
  const wallet = useAppContext()
  const RPC_URL = 'https://rpc.tzkt.io/ghostnet';
  const Tezos = new TezosToolkit(RPC_URL)
  Tezos.setPackerProvider(new MichelCodecPacker())
  Tezos.setWalletProvider(wallet)

  const [balance, setBalance] = useState(0)
  const [address, setAddress] = useState('')
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        await connectionExistsCheck();
      } catch (error) {
        console.error(error);
      } finally {
        setIsAuthLoaded(true)
      };
    }

    loadAuth();
  }, []);

  useEffect(() => {
    const updateBalance = async () => {
      if (address === '') return;
      
      const bal = await Tezos.rpc.getBalance(address)
      setBalance(bal.toNumber() / 1000000)
    }

    updateBalance();
  }, [address])

  const connectionExistsCheck = async () => {
    if (!wallet) return false
    const activeAccount = await wallet.client.getActiveAccount()
    if (activeAccount) {
      console.log(`Already connected: ${activeAccount.address}`)
      setAddress(activeAccount.address)
      localStorage.setItem('tzAddress', address)
      return true
    }
    return false
  }

  const connectWallet = async () => {
    const connectionExists = await connectionExistsCheck()
    if (!connectionExists) {
      await wallet.requestPermissions({
        network: {
          type: NetworkType.GHOSTNET,
          // type: NetworkType.MAINNET,
          rpcUrl: RPC_URL,
        },
      })
      const addr = await wallet.getPKH()
      setAddress(addr)
      localStorage.setItem('tzAddress', address)
    } else {
      alert(`Already connected`)
    }
  }

  const disconnectWallet = async () => {
    await wallet.clearActiveAccount()
    setAddress('')
    localStorage.removeItem('tzAddress')
    alert('Disconnected.')
  }

  return {
    connectWallet,
    disconnectWallet,
    wallet,
    Tezos,
    address,
    balance,
    isAuthLoaded,
  }
}

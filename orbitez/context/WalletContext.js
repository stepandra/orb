import { createContext, useContext } from 'react';

const WalletContext = createContext({});

export default WalletContext;

export const useWalletContext = () => {
  return useContext(WalletContext);
};

import React from 'react';
import useWallet from '@hooks/useWallet';
import WalletContext from './WalletContext';

const WalletProvider = ({ children }) => {
  const { wallet } = useWallet();

  return (
    <WalletContext.Provider value={ wallet }>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;

import React from 'react';
import SelectedServerProvider from './SelectedServerProvider';
import WalletProvider from './WalletProvider';

const ContextProviders = ({ children }) => {
  return (
    <WalletProvider>
      <SelectedServerProvider>
          {children}
      </SelectedServerProvider>
    </WalletProvider>
  );
};

export default ContextProviders;

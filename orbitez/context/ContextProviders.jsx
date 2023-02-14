import React from 'react';
import SelectedServerProvider from './SelectedServerProvider';
import ContractServersProvider from './ContractServersProvider';
import WalletProvider from './WalletProvider';

const ContextProviders = ({ children }) => {
  return (
    <WalletProvider>
      <SelectedServerProvider>
        <ContractServersProvider>
          {children}
        </ContractServersProvider>
      </SelectedServerProvider>
    </WalletProvider>
  );
};

export default ContextProviders;

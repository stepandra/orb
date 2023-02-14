import React from 'react';
import useContractServers from '@hooks/useContractServers';
import ContractServersContext from './ContractServersContext';

const ContractServersProvider = ({ children }) => {
  const { ...contractServersArgs } = useContractServers();

  return (
    <ContractServersContext.Provider value={{ ...contractServersArgs }}>
      {children}
    </ContractServersContext.Provider>
  );
};

export default ContractServersProvider;

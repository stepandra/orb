import { createContext, useContext } from 'react';

const ContractServersContext = createContext({});

export default ContractServersContext;

export const useContractServersContext = () => {
  return useContext(ContractServersContext);
};

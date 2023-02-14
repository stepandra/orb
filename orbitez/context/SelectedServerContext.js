import { createContext, useContext } from 'react';

const SelectedServerContext = createContext({});

export default SelectedServerContext;

export const useSelectedServerContext = () => {
  return useContext(SelectedServerContext);
};

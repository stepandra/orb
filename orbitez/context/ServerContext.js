import { createContext, useContext } from 'react';

const ServerContext = createContext({});

export default ServerContext;

export const useServerContext = () => {
  return useContext(ServerContext);
};

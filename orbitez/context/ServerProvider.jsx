import React from 'react';
import useServer from '@hooks/useServer';
import ServerContext from './ServerContext';

const ServerProvider = ({ children }) => {
  const { ...serverArgs } = useServer();

  return (
    <ServerContext.Provider value={{ ...serverArgs }}>
      {children}
    </ServerContext.Provider>
  );
};

export default ServerProvider;

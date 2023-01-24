import React from 'react';
import ServerProvider from './ServerProvider';

const ContextProviders = ({ children }) => {
  return (
    <ServerProvider>
      {children}
    </ServerProvider>
  );
};

export default ContextProviders;

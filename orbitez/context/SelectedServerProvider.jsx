import React from 'react';
import useSelectedServer from '@hooks/useSelectedServer';
import SelectedServerContext from './SelectedServerContext';

const SelectedServerProvider = ({ children }) => {
  const { ...serverArgs } = useSelectedServer();

  return (
    <SelectedServerContext.Provider value={{ ...serverArgs }}>
      {children}
    </SelectedServerContext.Provider>
  );
};

export default SelectedServerProvider;

import React from 'react';
import SelectedServerProvider from './SelectedServerProvider';

const ContextProviders = ({ children }) => {
  return (
      <SelectedServerProvider>
          {children}
      </SelectedServerProvider>
  );
};

export default ContextProviders;

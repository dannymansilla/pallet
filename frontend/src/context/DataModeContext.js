import React, { createContext, useContext, useState } from 'react';

const DataModeContext = createContext();

export const DataModeProvider = ({ children }) => {
  const [useSampleData, setUseSampleData] = useState(true);

  const toggleDataMode = (value) => {
    setUseSampleData(value);
  };

  return (
    <DataModeContext.Provider value={{ useSampleData, toggleDataMode }}>
      {children}
    </DataModeContext.Provider>
  );
};

export const useDataMode = () => {
  const context = useContext(DataModeContext);
  if (!context) {
    throw new Error('useDataMode must be used within a DataModeProvider');
  }
  return context;
}; 
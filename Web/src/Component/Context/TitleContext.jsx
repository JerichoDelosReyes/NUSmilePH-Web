import React, { createContext, useState, useContext } from 'react';

const TitleContext = createContext();

export const TitleProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('NuSmilePH');

  return (
    <TitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

export const useTitle = () => useContext(TitleContext);
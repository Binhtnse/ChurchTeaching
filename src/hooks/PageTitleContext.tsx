import React, { createContext, useState } from 'react';

export const PageTitleContext = createContext<{
  pageTitle: string;
  setPageTitle: (title: string) => void;
}>({ pageTitle: '', setPageTitle: () => {} });

export const PageTitleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('');

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};
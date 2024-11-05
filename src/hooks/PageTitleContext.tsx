import React, { createContext, useState } from 'react';

export const PageTitleContext = createContext<{
  pageTitle: string;
  pageTitleColor: string;
  setPageTitle: (title: string, color?: string) => void;
}>({ pageTitle: '', pageTitleColor: '', setPageTitle: () => {} });

export const PageTitleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('');
  const [pageTitleColor, setPageTitleColor] = useState('');

  const setPageTitleWithColor = (title: string, color: string = '') => {
    setPageTitle(title);
    setPageTitleColor(color);
  };

  return (
    <PageTitleContext.Provider value={{ pageTitle, pageTitleColor, setPageTitle: setPageTitleWithColor }}>
      {children}
    </PageTitleContext.Provider>
  );
};
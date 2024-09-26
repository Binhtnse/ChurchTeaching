import { useContext } from 'react';
import { PageTitleContext } from './PageTitleContext';

const usePageTitle = () => {
  return useContext(PageTitleContext);
};

export default usePageTitle;
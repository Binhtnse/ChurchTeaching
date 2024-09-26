import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation } from 'react-router-dom';
import usePageTitle from "../hooks/usePageTitle";

export default function MyContent({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { pageTitle } = usePageTitle();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return {
      key: url,
      title: index === pathSnippets.length - 1 ? pageTitle : pathSnippets[index].charAt(0).toUpperCase() + pathSnippets[index].slice(1),
    };
  });

  return (
    <Content className='px-3 py-20 ml-64'>
      <Breadcrumb items={[{ title: 'Home' }, ...breadcrumbItems]} />
      <main className='h-full'>{children}</main>
    </Content>
  );
}
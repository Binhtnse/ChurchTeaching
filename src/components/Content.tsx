import { Content } from 'antd/es/layout/layout';
import React from 'react';  

export default function MyContent({ children }: { children: React.ReactNode }) {
  return (
    <Content className='px-3 py-8 ml-4'>
      <main className='h-full mt-2'>{children}</main>
    </Content>
  );
}


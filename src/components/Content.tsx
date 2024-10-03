import { Content } from 'antd/es/layout/layout';
import React from 'react';

export default function MyContent({ children }: { children: React.ReactNode }) {
  return (
    <Content className='px-3 py-20 ml-4'>
      <main className='h-full mt-8'>{children}</main>
    </Content>
  );
}


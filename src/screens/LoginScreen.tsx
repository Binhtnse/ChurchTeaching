import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Image } from 'antd';

const { Title } = Typography;

const LoginScreen: React.FC = () => {
  const onFinish = (values: unknown) => {
    console.log('Received values:', values);
    // Handle login logic here
  };

  return (
    <div className="flex h-screen">
      <div className="w-[70%] bg-cover bg-center">
        <Image src='../assets/texas-painted-churches-1.jpg' />
      </div>
      <div className="w-[30%] flex items-center justify-center bg-white">
        <div className="w-4/5">
          <Title level={2} className="text-center mb-8">Đăng nhập</Title>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="account"
              rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên tài khoản" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
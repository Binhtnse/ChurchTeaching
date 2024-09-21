import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Image } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice';

const { Title } = Typography;

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values: { account: string; password: string }) => {
    try {
      const response = await axios.post(
        'https://sep490-backend-production.up.railway.app/api/v1/user/login',
        {
          account: values.account,
          password: values.password,
        }
      );
      console.log('Login successful:', response.data);
      message.success('Đăng nhập thành công!');

      const userLogin = response.data.userLogin || {};
      localStorage.setItem('userLogin', JSON.stringify(response.data.userLogin));
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      dispatch(setAuth({
        isLoggedIn: true,
        role: userLogin.roleName ? userLogin.roleName.toUpperCase() : '',
        userName: userLogin.name || '',
      }));
      
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      message.error('Đăng nhập thất bại. Vui lòng thử lại!');
    }
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
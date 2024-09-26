import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, message, Button, Modal, Form, Input } from 'antd';
import axios from 'axios';
import { useAuthState } from '../hooks/useAuthState';
import usePageTitle from "../hooks/usePageTitle";

interface UserData {
  id: number;
  fullName: string;
  email: string;
  dob: string;
  address: string;
  gender: string;
  phoneNumber: string;
}

const AccountDetailScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { isLoggedIn } = useAuthState();
  const [form] = Form.useForm();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle('Thông tin tài khoản', '#4154f1');
  }, [setPageTitle]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn) {
        try {
          const userString = localStorage.getItem("userLogin");
          const user = userString ? JSON.parse(userString) : null;
          const userId = user?.id;

          if (userId) {
            const response = await axios.get(`https://sep490-backend-production.up.railway.app/api/v1/user?id=${userId}`);
            setUserData(response.data.data);
          } else {
            message.error('User ID not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          message.error('Failed to load user data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        message.error('User not logged in');
      }
    };

    fetchUserData();
  }, [isLoggedIn]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleChangePassword = async (values: { oldPassword: string; newPassword: string }) => {
    try {
      const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
      const response = await axios.post(
        'https://sep490-backend-production.up.railway.app/api/v1/user/change-password',
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success('Password changed successfully');
      console.log(response);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Failed to change password');
    }
  };

  if (loading) {
    return <Spin size="large" className="flex justify-center items-center h-screen" />;
  }

  if (!isLoggedIn) {
    return <div className="text-center text-red-500">Please log in to view account details</div>;
  }

  if (!userData) {
    return <div className="text-center text-red-500">Failed to load user data</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card title="Account Details" className="shadow-lg">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Full Name">{userData.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">{userData.dob}</Descriptions.Item>
          <Descriptions.Item label="Address">{userData.address}</Descriptions.Item>
          <Descriptions.Item label="Gender">{userData.gender}</Descriptions.Item>
          <Descriptions.Item label="Phone Number">{userData.phoneNumber}</Descriptions.Item>
        </Descriptions>
        <Button type="primary" onClick={showModal} className="mt-4">
          Change Password
        </Button>
      </Card>

      <Modal
        title="Change Password"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleChangePassword} layout="vertical">
          <Form.Item
            name="oldPassword"
            label="Old Password"
            rules={[{ required: true, message: 'Please input your old password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true, message: 'Please input your new password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountDetailScreen;

import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, message } from 'antd';
import axios from 'axios';
import { useAuthState } from '../hooks/useAuthState';

interface UserData {
  id: number;
  fullName: string;
  email: string;
  dob: string;
  address: string;
  gender: string;
  phoneNumber: string;
  role: string;
  status: string;
  account: string;
}

const AccountDetailScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn} = useAuthState();

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
          <Descriptions.Item label="Role">{userData.role}</Descriptions.Item>
          <Descriptions.Item label="Status">{userData.status}</Descriptions.Item>
          <Descriptions.Item label="Account">{userData.account}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default AccountDetailScreen;

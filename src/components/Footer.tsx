import React from 'react';
import { Typography, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;

const MyFooter: React.FC = () => {
  return (
    <footer>
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-end -mx-4">
            <div className="w-full sm:w-1/4 px-4 mb-8 sm:mb-0">
              <Space direction="vertical">
                <img src="src\assets\vecteezy_cross-christian_1194154.png" alt="Church Logo" className="h-12" />
                <Title level={4}>ChurchTeaching</Title>
              </Space>
            </div>
            <div className="w-full sm:w-1/4 px-4 mb-8 sm:mb-0">
              <Space direction="vertical">
                <Title level={4}>Contact Us</Title>
                <Text>123 Church Street, City, State 12345</Text>
                <Text>Phone: (123) 456-7890</Text>
                <Text>Email: info@churchteaching.com</Text>
              </Space>
            </div>
            <div className="w-full sm:w-1/4 px-4">
              <Space direction="vertical">
                <Title level={4}>Follow Us</Title>
                <Space>
                  <Link href="https://facebook.com/churchteaching" target="_blank">
                    <FacebookOutlined className="text-2xl" />
                  </Link>
                  <Link href="https://twitter.com/churchteaching" target="_blank">
                    <TwitterOutlined className="text-2xl" />
                  </Link>
                  <Link href="https://instagram.com/churchteaching" target="_blank">
                    <InstagramOutlined className="text-2xl" />
                  </Link>
                </Space>
              </Space>
            </div>
          </div>
        </div>
      </div>
      <div className="py-4" style={{ backgroundColor: '#939393' }}>
        <div className="container mx-auto px-4 text-center">
          <Text className="text-white">&copy; {new Date().getFullYear()} ChurchTeaching. All rights reserved.</Text>
        </div>
      </div>
    </footer>
  );
};

export default MyFooter;

import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthState } from '../hooks/useAuthState';
import ForbiddenScreen from './ForbiddenScreen';
import axios from 'axios';

interface Student {
  key: string;
  stt: number;
  name: string;
  phone: string;
  gender: string;
  email: string;
}

const StudentListScreen: React.FC = () => {
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    if (isLoggedIn && role === 'CATECHIST') {
      fetchStudents();
    }
  }, [isLoggedIn, role]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://sep490-backend-production.up.railway.app/api/v1/class/get-students?classId=1');
      if (response.data && response.data.data && Array.isArray(response.data.data.students)) {
        setStudents(response.data.data.students);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Student> = [
    { title: 'STT', dataIndex: 'stt', key: 'stt' },
    { title: 'Tên thiếu nhi', dataIndex: 'name', key: 'name' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Hành động',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link">Sửa</Button>
          <Button type="link" danger>Xóa</Button>
        </Space>
      ),    },
  ];


  const handleViewClassGrades = () => {
    // Implement view class grades logic
    console.log('Viewing class grades');
  };

  const handleAttendance = () => {
    // Implement attendance logic
    console.log('Taking attendance');
  };

  if (!isLoggedIn || role !== 'CATECHIST') {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Tìm kiếm thiếu nhi"
          prefix={<SearchOutlined />}
          onChange={(e) => console.log(e.target.value)}
          className="w-64"
        />
        <Space>
          <Button onClick={handleViewClassGrades}>Xem điểm lớp</Button>
          <Button type="primary" onClick={handleAttendance}>Điểm danh</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={students} loading={loading} />
    </div>
  );
};

export default StudentListScreen;

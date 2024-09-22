import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthState } from '../hooks/useAuthState';
import { useNavigate } from 'react-router-dom';

interface Student {
  key: string;
  stt: number;
  name: string;
  phone: string;
  gender: string;
  email: string;
}

const StudentListScreen: React.FC = () => {
  const { isLoggedIn, role } = useAuthState();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      message.error('Bạn cần đăng nhập để xem danh sách học sinh');
      navigate('/login');
      return;
    }

    if (role !== 'TEACHER' && role !== 'ADMIN') {
      message.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }

    // Fetch students data here
    // For now, we'll use dummy data
    const dummyData: Student[] = [
      { key: '1', stt: 1, name: 'Nguyễn Văn A', phone: '0123456789', gender: 'Nam', email: 'nguyenvana@example.com' },
      { key: '2', stt: 2, name: 'Trần Thị B', phone: '0987654321', gender: 'Nữ', email: 'tranthib@example.com' },
      // Add more dummy data as needed
    ];
    setStudents(dummyData);
  }, [isLoggedIn, role, navigate]);

  const columns: ColumnsType<Student> = [
    { title: 'STT', dataIndex: 'stt', key: 'stt' },
    { title: 'Tên thiếu nhi', dataIndex: 'name', key: 'name' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Hành động',
      key: 'action',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">Sửa</Button>
          <Button type="link" danger>Xóa</Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
    // Implement search logic here
  };

  const handleViewClassGrades = () => {
    // Implement view class grades logic
    console.log('Viewing class grades');
  };

  const handleAttendance = () => {
    // Implement attendance logic
    console.log('Taking attendance');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Tìm kiếm thiếu nhi"
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64"
        />
        <Space>
          <Button onClick={handleViewClassGrades}>Xem điểm lớp</Button>
          <Button type="primary" onClick={handleAttendance}>Điểm danh</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={students} />
    </div>
  );
};

export default StudentListScreen;

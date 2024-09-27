import React, { useState, useEffect } from 'react';
import { Table, Input, Select, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useAuthState } from '../hooks/useAuthState';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

interface Subject {
  id: string;
  name: string;
  major: string;
  grade: string;
  class: string;
}

const SubjectListScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const { role, isLoggedIn } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || (role !== 'ADMIN' && role !== 'CATECHIST')) {
      message.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [isLoggedIn, role, navigate]);

  const data: Subject[] = [
    // Add your subject data here
    { id: '1', name: 'Toán', major: 'Khoa học tự nhiên', grade: '10', class: '10A1' },
    { id: '2', name: 'Văn', major: 'Khoa học xã hội', grade: '11', class: '11A2' },
    // ...more subjects
  ];

  const columns = [
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngành',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Khối',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
  ];

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) &&
      (!gradeFilter || item.grade === gradeFilter)
  );

  if (!isLoggedIn || (role !== 'ADMIN' && role !== 'CATECHIST')) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center">
        <Input
          placeholder="Tìm kiếm theo tên môn học"
          prefix={<SearchOutlined />}
          className="mr-4 w-64"
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="Lọc theo Khối"
          className="w-32"
          allowClear
          onChange={(value) => setGradeFilter(value)}
        >
          <Option value="10">Khối 10</Option>
          <Option value="11">Khối 11</Option>
          <Option value="12">Khối 12</Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        className="w-full"
      />
    </div>
  );
};

export default SubjectListScreen;

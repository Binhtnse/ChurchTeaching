import React, { useState, useEffect, useCallback } from 'react';
import { Table as AntTable, Tag, Pagination, message } from 'antd';
import axios from 'axios';
import { useAuthState } from '../hooks/useAuthState';
import ForbiddenScreen from './ForbiddenScreen';
import usePageTitle from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';

interface Child {
  id: number;
  account: string;
  name: string;
  grade: string;
  year: string;
  isEnrollInClass: string;
  gradeId: number;
  yearId: number;
}

interface ApiResponse {
    data: Child[];
  }

const ParentListChildrenScreen: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, role} = useAuthState();
  const { setPageTitle } = usePageTitle();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle('Danh sách con', '#4154f1');
  }, [setPageTitle]);

  const fetchChildren = useCallback(async () => {
    if (isLoggedIn && role === 'PARENT') {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const userString = localStorage.getItem("userLogin");
        const user = userString ? JSON.parse(userString) : null;
        const parentId = user?.id;
        const response = await axios.get<ApiResponse>(
            `https://sep490-backend-production.up.railway.app/api/v1/get-list-child/${parentId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

        setChildren(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.length
        }));
      } catch (error) {
        console.error('Error fetching children:', error);
        message.error('Không thể tải danh sách con');
      } finally {
        setLoading(false);
      }
    }
  }, [isLoggedIn, role]); 

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_: unknown, __: unknown, index: number) => 
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Tên tài khoản',
      dataIndex: 'account',
      key: 'account',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Khối',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Năm học',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isEnrollInClass',
      key: 'isEnrollInClass',
      render: (isEnrolled: string) => {
        const color = isEnrolled === 'true' ? 'green' : 'red';
        const text = isEnrolled === 'true' ? 'Đã có lớp' : 'Chưa có lớp';
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  if (!isLoggedIn || role !== 'PARENT') {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Danh sách con
      </h1>

      <AntTable
        columns={columns}
        dataSource={children}
        rowKey={(record) => record.id.toString()}
        loading={loading}
        className="w-full bg-white rounded-lg shadow"
        pagination={false}
        onRow={(record) => ({
          onClick: () => navigate(`/children-list/${record.id}`),
          style: { cursor: 'pointer' }
        })}
      />

      <Pagination
        current={pagination.current}
        total={pagination.total}
        pageSize={pagination.pageSize}
        onChange={handlePaginationChange}
        showSizeChanger
        showQuickJumper
        showTotal={(total) => `Tổng ${total} mục`}
        className="mt-6 text-right"
      />
    </div>
  );
};

export default ParentListChildrenScreen;

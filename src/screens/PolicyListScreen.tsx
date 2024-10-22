import React, { useEffect, useState } from 'react';
import { Table, Typography, Spin, message } from 'antd';
import axios from 'axios';
import  usePageTitle  from '../hooks/usePageTitle';

const { Title } = Typography;

interface Policy {
  id: number;
  absenceLimit: number;
  numberOfMember: number;
  absenceWithPermissionLimit: number | null;
  status: string;
}

const PolicyListScreen: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Danh sách quy định", "#4154f1");
    fetchPolicies();
  }, [setPageTitle]);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('https://sep490-backend-production.up.railway.app/api/v1/policy');
      if (response.data.status === 'success') {
        setPolicies(response.data.data);
      } else {
        message.error('Failed to fetch policies');
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      message.error('An error occurred while fetching policies');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Số ngày nghỉ không phép tối đa',
      dataIndex: 'absenceLimit',
      key: 'absenceLimit',
    },
    {
      title: 'Number of Members',
      dataIndex: 'numberOfMember',
      key: 'numberOfMember',
    },
    {
      title: 'Số ngày nghỉ có phép tối đa',
      dataIndex: 'absenceWithPermissionLimit',
      key: 'absenceWithPermissionLimit',
      render: (value: number | null) => value ?? 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Title level={2} className="mb-6 text-blue-600">Quy định giảng dạy giáo lý</Title>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={policies}
          columns={columns}
          rowKey="id"
          className="bg-white shadow-md rounded-lg overflow-hidden"
          pagination={false}
        />
      )}
    </div>
  );
};

export default PolicyListScreen;

import React, { useState, useEffect } from 'react';
import { Table, Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import usePageTitle from '../hooks/usePageTitle';


interface LeaveRequest {
  id: number;
  requestTime: string;
  reason: string;
  studentName: string;
  className: string;
  status: string;
  timeTableName: string;
  timeTableTime: string;
}

const CatechistLeaveRequestListScreen: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { timeTableId } = useParams<{ timeTableId: string }>();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Danh sách đơn xin nghỉ", "#4154f1");
  }, [setPageTitle]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/leave-requests/catechist/${timeTableId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
        setLeaveRequests(response.data.data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [timeTableId]);

  const columns = [
    {
      title: 'Tên thiếu nhi',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Thời gian xin nghỉ',
      dataIndex: 'timeTableTime',
      key: 'timeTableTime',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời gian gửi đơn',
      dataIndex: 'requestTime',
      key: 'requestTime',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`${status === 'TRUE' ? 'text-green-500' : 'text-red-500'}`}>
          {status === 'TRUE' ? 'Đã duyệt' : 'Chưa duyệt'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/schedule/attendance/${timeTableId}`)}
        className="mb-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      >
        Quay lại điểm danh
      </Button>
      
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Danh sách đơn xin nghỉ
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={leaveRequests}
          rowKey="id"
          className="border border-gray-200 rounded-lg"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} đơn`,
          }}
        />
      )}
    </div>
  );
};

export default CatechistLeaveRequestListScreen;

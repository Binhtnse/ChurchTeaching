import React, { useState, useEffect } from 'react';
import { Table, Spin, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

interface Transaction {
  tuitionId: number;
  className: string;
  grade: string;
  amount: number;
  donate: number | null;
  status: string;
  transactionDate: string;
  academicYear: string;
  student: {
    id: number;
    fullNameStudent: string;
    className: string;
    role: string;
  };
  payer: {
    id: number;
    fullNamePayer: string;
    role: string;
  };
}

interface ApiResponse {
  status: string;
  message: string | null;
  timestamp: string;
  pageResponse: {
    currentPage: number;
    totalPage: number;
    pageSize: number;
    nextPage: number | null;
    previousPage: number | null;
    totalElements: number | null;
  };
  data: Transaction[];
}

const TransactionHistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [academicYears, setAcademicYears] = useState<{ id: number; year: string }[]>([]);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchTransactions();
    }
  }, [selectedAcademicYear, selectedGrade]);

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get('https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE');
      setAcademicYears(response.data);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=10',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === 'success') {
        setGrades(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get<ApiResponse>(
        'https://sep490-backend-production.up.railway.app/api/v1/tuition/admin/transactions?page=1&size=10'
      );
      setTransactions(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const handleAcademicYearChange = (value: number) => {
    setSelectedAcademicYear(value);
  };

  const handleGradeChange = (value: number) => {
    setSelectedGrade(value);
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'tuitionId',
      key: 'tuitionId',
    },
    {
      title: 'Tên lớp',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toFixed(2)} VNĐ`,
    },
    {
      title: 'Đóng góp thêm',
      dataIndex: 'donate',
      key: 'donate',
      render: (donate: number | null) => (donate ? `${donate.toFixed(2)} VNĐ` : '-'),
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
    },
    {
      title: 'Niên khóa',
      dataIndex: 'academicYear',
      key: 'academicYear',
    },
    {
      title: 'Thiếu nhi',
      dataIndex: 'student',
      key: 'student',
      render: (student: Transaction['student']) => student.fullNameStudent,
    },
    {
      title: 'Người thanh toán',
      dataIndex: 'payer',
      key: 'payer',
      render: (payer: Transaction['payer']) => payer.fullNamePayer,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
      <div className="mb-4 flex space-x-4">
        <Select
          style={{ width: 200 }}
          placeholder="Select Academic Year"
          onChange={handleAcademicYearChange}
        >
          {academicYears.map((year) => (
            <Option key={year.id} value={year.id}>
              {year.year}
            </Option>
          ))}
        </Select>
        <Select
          style={{ width: 200 }}
          placeholder="Select Grade"
          onChange={handleGradeChange}
          allowClear
        >
          {grades.map((grade) => (
            <Option key={grade.id} value={grade.id}>
              {grade.name}
            </Option>
          ))}
        </Select>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="tuitionId"
          className="shadow-md"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
        />
      )}
    </div>
  );
};

export default TransactionHistoryScreen;

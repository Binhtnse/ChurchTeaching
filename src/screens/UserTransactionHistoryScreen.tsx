import React, { useState, useEffect } from "react";
import { Table, Typography, Spin, message } from "antd";
import axios from "axios";

const { Title } = Typography;

interface Transaction {
  tuitionId: number;
  className: string;
  grade: string;
  amount: number;
  donate: number;
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

const UserTransactionHistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true);
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const userId = user ? user.id : null;

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get<ApiResponse>(
        `https://sep490-backend-production.up.railway.app/api/v1/tuition/transactions/${userId}?page=${page}&size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setTransactions(response.data.data);
      }

      if (response.data && response.data.pageResponse) {
        setPagination((prev) => ({
          ...prev,
          total: (response.data.pageResponse.totalPage || 1) * pageSize,
          current: page,
          pageSize: pageSize,
        }));
      } else {
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: pageSize,
        }));
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Failed to fetch transaction history");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Khối",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Tổng thanh toán",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `${amount.toLocaleString()} VND`,
    },
    {
      title: "Đóng góp thêm",
      dataIndex: "donate",
      key: "donate",
      render: (donate: number) => `${donate.toLocaleString()} VND`,
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
    },
    {
      title: "Niên khóa",
      dataIndex: "academicYear",
      key: "academicYear",
    },
    {
      title: "Thiếu nhi",
      dataIndex: ["student", "fullNameStudent"],
      key: "student",
    },
    {
      title: "Người thanh toán",
      dataIndex: ["payer", "fullNamePayer"],
      key: "payer",
    },
  ].map((column) => ({
    ...column,
    className: "px-4 py-2",
    headerClassName: "bg-blue-500 text-white font-bold",
  }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Title
          level={2}
          className="mb-6 text-blue-600 pb-2 border-b-2 border-blue-400"
        >
          Lịch sử giao dịch
        </Title>
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="tuitionId"
            pagination={pagination}
            onChange={(newPagination) =>
              fetchTransactions(newPagination.current, newPagination.pageSize)
            }
            className="bg-white rounded-lg shadow-lg"
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
          />
        </Spin>
      </div>
    </div>
  );
};

export default UserTransactionHistoryScreen;

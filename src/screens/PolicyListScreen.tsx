import React, { useEffect, useState } from "react";
import { Table, Typography, Spin, message } from "antd";
import axios from "axios";
import usePageTitle from "../hooks/usePageTitle";

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
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/policy"
      );
      if (response.data.status === "success") {
        setPolicies(response.data.data);
      } else {
        message.error("Failed to fetch policies");
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
      message.error("An error occurred while fetching policies");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      width: "10%",
      align: "center" as const,
    },
    {
      title: "Số ngày nghỉ không phép tối đa",
      dataIndex: "absenceLimit",
      key: "absenceLimit",
      width: "30%",
      align: "center" as const,
    },
    {
      title: "Số ngày nghỉ có phép tối đa",
      dataIndex: "absenceWithPermissionLimit",
      key: "absenceWithPermissionLimit",
      width: "30%",
      align: "center" as const,
      render: (value: number | null) => value ?? "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "30%",
      align: "center" as const,
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded-full ${
            status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status === "ACTIVE" ? "Đang áp dụng" : "Chưa áp dụng"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Title level={2} className="mb-6 text-blue-600 text-center font-bold">
          Quy định giảng dạy giáo lý
        </Title>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <Table
              dataSource={policies}
              columns={columns}
              rowKey="id"
              pagination={false}
              className="policy-table"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyListScreen;

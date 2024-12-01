import React, { useState, useEffect } from "react";
import { Table, Tag, message, Image, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

interface RequestData {
  id: number;
  nameCreator: string;
  className: string;
  classId: number;
  reason: string;
  link: string;
  status: string;
}

const AdminEditGradesRequesetScreen: React.FC = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/get-reopen-request",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      message.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/reopen-request/${id}?active=${action}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success(
        `Yêu cầu đã được ${action === "approve" ? "chấp nhận" : "từ chối"}`
      );
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.log(error);
      message.error("Không thể xử lý yêu cầu");
    }
  };

  type RequestStatus = "APPROVE" | "REJECT" | "WAIT_APPROVE" | "APPROVED";

  const statusConfig: Record<RequestStatus, { text: string; color: string }> = {
    APPROVE: { text: "Đã chấp nhận", color: "green" },
    REJECT: { text: "Đã từ chối", color: "red" },
    WAIT_APPROVE: { text: "Đang chờ", color: "processing" },
    APPROVED: { text: "Đã chấp nhận và sửa điểm", color: "success" },
  };

  const columns: ColumnsType<RequestData> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Người tạo",
      dataIndex: "nameCreator",
      key: "nameCreator",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
      render: (text) => <span className="text-blue-600">{text}</span>,
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: (text) => <span className="text-gray-600 italic">{text}</span>,
    },
    {
      title: "Minh chứng",
      dataIndex: "link",
      key: "link",
      render: (link) => (
        <Image
          src={link}
          alt="Evidence"
          className="rounded-lg"
          width={100}
          height={100}
          style={{ objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: RequestStatus) => {
        return (
          <Tag color={statusConfig[status]?.color}>
            {statusConfig[status]?.text}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) =>
        record.status === "WAIT_APPROVE" && (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              className="bg-green-500 hover:bg-green-600"
              onClick={() => handleAction(record.id, "approve")}
            >
              Chấp nhận
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => handleAction(record.id, "reject")}
            >
              Từ chối
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Danh sách yêu cầu chỉnh sửa điểm danh
      </h1>
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={requests}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} yêu cầu`,
          }}
          className="overflow-x-auto"
        />
      </div>
    </div>
  );
};

export default AdminEditGradesRequesetScreen;

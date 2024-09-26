import React, { useState, useEffect } from "react";
import { Table, Space, Button, message } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import usePageTitle from "../hooks/usePageTitle";

interface ClassData {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  gradeName: string;
  academicYear: number;
  status: string;
}

const AdminClassListScreen: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    setPageTitle('Danh sách lớp học', '#4154f1');
  }, [setPageTitle]);

  useEffect(() => {
    if (isLoggedIn && role === "ADMIN") {
      fetchClasses();
    }
  }, [isLoggedIn, role]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/class/list?page=1&size=10",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setClasses(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching classes:", error);
      message.error("Failed to load class data");
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên lớp",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: "Khối",
      dataIndex: "gradeName",
      key: "gradeName",
    },
    {
      title: "Niên khóa",
      dataIndex: "academicYear",
      key: "academicYear",
    },
    {
      title: "Hành động",
      key: "action",
      render: () => (
        <Space size="middle">
          <Button type="primary" size="small" icon={<EditOutlined />}>Edit</Button>
          <Button danger size="small" icon={<DeleteOutlined />}>Delete</Button>
        </Space>
      ),    },
  ];

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">Danh sách lớp giáo lý</h1>
      </div>
      <Table
        columns={columns}
        dataSource={classes}
        onRow={() => {
          return {
            className: 'hover:bg-gray-100 transition-colors duration-200',
          };
        }}
        rowKey="id"        
        loading={loading}
        className="bg-white rounded-lg shadow-lg"
        pagination={{
          pageSize: 10,
          total: classes.length,
          showSizeChanger: false,
          className: "bg-white p-4",
        }}
      />
    </div>
  );
};

export default AdminClassListScreen;

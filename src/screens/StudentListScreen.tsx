import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, message, Typography } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";

const { Title } = Typography;

interface Student {
  key: string;
  stt: number;
  name: string;
  phone: string;
  gender: string;
  email: string;
}

const StudentListScreen: React.FC = () => {
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    if (isLoggedIn && role === "CATECHIST") {
      fetchStudents();
    }
  }, [isLoggedIn, role]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/class/get-students?classId=1"
      );
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.students)
      ) {
        setStudents(response.data.data.students);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Student> = [
    { title: "STT", dataIndex: "stt", key: "stt" },
    { title: "Tên thiếu nhi", dataIndex: "name", key: "name" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Giới tính", dataIndex: "gender", key: "gender" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Hành động",
      key: "action",
      render: () => (
        <Space size="middle">
          <Button type="link" className="text-blue-600 hover:text-blue-800">
            Sửa
          </Button>
          <Button type="link" className="text-red-600 hover:text-red-800">
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewClassGrades = () => {
    // Implement view class grades logic
    console.log("Viewing class grades");
  };

  const handleAttendance = () => {
    // Implement attendance logic
    console.log("Taking attendance");
  };

  if (!isLoggedIn || role !== "CATECHIST") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Title level={2} className="mb-6 text-center text-gray-800">
        Danh sách Thiếu Nhi
      </Title>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between mb-6">
          <Input
            placeholder="Tìm kiếm thiếu nhi"
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => console.log(e.target.value)}
            className="w-64"
          />
          <Space>
            <Button
              icon={<FileTextOutlined />}
              onClick={handleViewClassGrades}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Xem điểm lớp
            </Button>
            <Button
              type="primary"
              icon={<UserOutlined />}
              onClick={handleAttendance}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Điểm danh
            </Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={students}
          loading={loading}
          className="border border-gray-200 rounded-lg"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </div>
    </div>
  );
};

export default StudentListScreen;

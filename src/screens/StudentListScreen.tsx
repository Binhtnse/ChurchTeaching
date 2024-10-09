import React, { useState, useEffect, useCallback } from "react";
import { Table, Input, Button, Space, message, Typography } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";
import usePageTitle from "../hooks/usePageTitle";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

interface Student {
  id: number;
  studentClassId: number;
  fullName: string;
  account: string;
  status: string;
}

interface ClassInfo {
  id: number | null;
  className: string;
  students: Student[];
}

const StudentListScreen: React.FC = () => {
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [loading, setLoading] = useState(false);
  const { setPageTitle } = usePageTitle();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  useEffect(() => {
    setPageTitle("Danh sách thiếu nhi", "#4154f1");
  }, [setPageTitle]);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/get-students?classId=${classId}`
      );
      if (response.status === 200 || response.status === 304) {
        setClassInfo(response.data.data);
      } else {
        setClassInfo(null);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (isLoggedIn && role === "CATECHIST" && classId) {
      fetchStudents();
    }
  }, [isLoggedIn, role, classId, fetchStudents]);

  const handleBack = () => {
    navigate("/classes");
  };

  const columns: ColumnsType<Student> = [
    { title: "STT", dataIndex: "studentClassId", key: "studentClassId" },
    { title: "Tên thiếu nhi", dataIndex: "fullName", key: "fullName" },
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
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="mb-4"
      >
        Back to Class List
      </Button>
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
          dataSource={classInfo?.students}
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

import React, { useState, useEffect, useCallback } from "react";
import { Table, Input, Button, Space, message, Typography } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
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
  studentId: number;
  studentClassId: number;
  fullName: string;
  account: string;
  status: string;
}

interface ClassInfo {
  classId: number;
  className: string;
  students: Student[];
}

const StudentListScreen: React.FC = () => {
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [loading, setLoading] = useState(false);
  const { setPageTitle } = usePageTitle();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
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
      if (response.data.status === "success") {
        setClassInfo(response.data.data);
      } else {
        setClassInfo(null);
        message.error(response.data.message || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    console.log('Effect triggered:', { isLoggedIn, role, classId });
    if (isLoggedIn && role === "CATECHIST" && classId) {
      fetchStudents();
    }
  }, [isLoggedIn, role, classId, fetchStudents]);

  const handleBack = () => {
    navigate("/classes");
  };

  useEffect(() => {
    const initializeComponent = async () => {
      await checkAuthState();
      setInitialLoading(false);
    };
    initializeComponent();
  }, [checkAuthState]);
  
  if (initialLoading) {
    return <div>Loading...</div>;
  }

  const columns: ColumnsType<Student> = [
    { title: "STT", dataIndex: "studentClassId", key: "studentClassId" },
    { title: "Tên thiếu nhi", dataIndex: "fullName", key: "fullName" },
  ];

  const handleViewClassGrades = () => {
    const id = classInfo?.classId || classId;
    if (id) {
      navigate(`/catechist-grade/${id}`);
    } else {
      console.error("Class ID is undefined");
      message.error("Unable to view grades. Class ID is missing.");
    }
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
        Quay về danh sách lớp
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
          rowKey="studentId"
        />
      </div>
    </div>
  );
};

export default StudentListScreen;

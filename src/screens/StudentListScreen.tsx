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
  gender?: string;
  email?: string;
  phoneNumber?: string;
}

interface ClassInfo {
  classId: number;
  className: string;
  students: Student[];
}

interface ClassDetails {
  classId: number;
  className: string;
  numberOfCatechist: number;
  gradeName: string;
  academicYear: string;
  status: string;
  mainTeachers: {
    id: number;
    name: string;
    account: string;
    isMain: boolean;
  }[];
  assistantTeachers: {
    id: number;
    name: string;
    account: string;
    isMain: boolean;
  }[];
}

const StudentListScreen: React.FC = () => {
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [loading, setLoading] = useState(false);
  const { setPageTitle } = usePageTitle();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
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
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/get-students?classId=${classId}`
      );
      if (response.data.status === "success") {
        const studentsWithDetails = await Promise.all(
          response.data.data.students.map(async (student: Student) => {
            const detailsResponse = await axios.get(
              `https://sep490-backend-production.up.railway.app/api/v1/user?id=${student.studentId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (detailsResponse.data.status === "success") {
              return {
                ...student,
                gender: detailsResponse.data.data.gender,
                email: detailsResponse.data.data.email,
                phoneNumber: detailsResponse.data.data.phoneNumber,
              };
            }
            return student;
          })
        );
        setClassInfo({
          ...response.data.data,
          students: studentsWithDetails,
        });
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

  const fetchClassDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/${classId}`
      );
      if (response.data.status === "success") {
        setClassDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
      message.error("Failed to fetch class details");
    }
  }, [classId]);

  useEffect(() => {
    if (isLoggedIn && role === "CATECHIST" && classId) {
      fetchClassDetails();
      fetchStudents();
    }
  }, [isLoggedIn, role, classId, fetchClassDetails, fetchStudents]);

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
    { 
      title: "Giới tính", 
      dataIndex: "gender", 
      key: "gender",
      render: (gender: string) => gender === "MALE" ? "Nam" : "Nữ"
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
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
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="mb-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      >
        Quay về danh sách lớp
      </Button>

      {classDetails && (
      <div className="mb-6">
        <Title level={2} className="text-center text-gray-800 font-bold text-3xl">
          {classDetails.className}
        </Title>
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <p><strong>Khối:</strong> {classDetails.gradeName}</p>
          <p><strong>Năm học:</strong> {classDetails.academicYear}</p>
          <p><strong>Số lượng thiếu nhi:</strong> {classInfo?.students?.length || 0}</p>
          <p><strong>Giáo lý viên chính:</strong> {classDetails.mainTeachers.map(t => t.name).join(', ')}</p>
          {classDetails.assistantTeachers.length > 0 && (
            <p><strong>Giáo lý viên phụ:</strong> {classDetails.assistantTeachers.map(t => t.name).join(', ')}</p>
          )}
        </div>
      </div>
    )}

      <Title
        level={2}
        className="mb-6 text-center text-gray-800 font-bold text-3xl"
      >
        Danh sách Thiếu Nhi
      </Title>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex justify-between mb-6">
          <Input
            placeholder="Tìm kiếm thiếu nhi"
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => console.log(e.target.value)}
            className="w-64 rounded-md border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <Space>
            <Button
              icon={<FileTextOutlined />}
              onClick={handleViewClassGrades}
              className="bg-green-500 text-white hover:bg-green-600 font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
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
          rowClassName={() => "hover:bg-gray-50 transition-colors duration-200"}
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

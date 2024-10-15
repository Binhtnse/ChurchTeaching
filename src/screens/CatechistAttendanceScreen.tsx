import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, message, Typography, Checkbox } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";
import usePageTitle from "../hooks/usePageTitle";
import { useParams, useNavigate } from "react-router-dom";

const { Title } = Typography;

interface Student {
  id: number;
  studentClassId: number;
  fullName: string;
  account: string;
  status: string;
  isPresent: boolean;
}

const CatechistAttendanceScreen: React.FC = () => {
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [loading, setLoading] = useState(false);
  const { setPageTitle } = usePageTitle();
  const [students, setStudents] = useState<Student[]>([]);
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  useEffect(() => {
    setPageTitle("Điểm danh", "#4154f1");
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
        const studentsWithAttendance = response.data.data.students.map((student: Student) => ({
          ...student,
          isPresent: false,
        }));
        setStudents(studentsWithAttendance);
      } else {
        setStudents([]);
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

  const handleAttendanceChange = (studentId: number, isPresent: boolean) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, isPresent } : student
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      // Implement the API call to save attendance here
      // For now, we'll just log the attendance data
      console.log("Saving attendance:", students);
      message.success("Attendance saved successfully");
    } catch (error) {
      console.error("Error saving attendance:", error);
      message.error("Failed to save attendance");
    }
  };

  const columns: ColumnsType<Student> = [
    { title: "STT", dataIndex: "studentClassId", key: "studentClassId" },
    { title: "Tên thiếu nhi", dataIndex: "fullName", key: "fullName" },
    {
      title: "Điểm danh",
      key: "attendance",
      render: (_, record) => (
        <Checkbox
          checked={record.isPresent}
          onChange={(e) => handleAttendanceChange(record.id, e.target.checked)}
        />
      ),
    },
  ];

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
        Điểm Danh Thiếu Nhi
      </Title>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Table
          columns={columns}
          dataSource={students}
          loading={loading}
          className="border border-gray-200 rounded-lg mb-6"
          pagination={false}
          rowKey="id"
        />
        <div className="flex justify-end">
          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveAttendance}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Lưu điểm danh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CatechistAttendanceScreen;

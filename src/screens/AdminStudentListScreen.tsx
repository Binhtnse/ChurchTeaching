import React, { useState, useEffect } from "react";
import { Table, message } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";

interface Student {
  id: number;
  fullName: string;
  gender: string;
  address: string;
  dob: string;
  phoneNumber: string;
}

const AdminStudentListScreen: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, role, checkAuthState } = useAuthState();

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    if (isLoggedIn && role === "ADMIN") {
      fetchStudents();
    }
  }, [isLoggedIn, role]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/user/list?page=1&size=10",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const studentData = response.data.data.filter(
        (user: { role: string }) => user.role === "STUDENT"
      );
      setStudents(studentData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Failed to load student data");
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Lớp",
      key: "class",
      render: () => "N/A",
    },
    {
      title: "Phụ huynh",
      key: "parent",
      render: () => "N/A",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
  ];

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách học sinh</h1>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={loading}
        className="w-full"
        pagination={{
          pageSize: 10,
          total: students.length,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default AdminStudentListScreen;

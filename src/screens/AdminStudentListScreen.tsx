import React, { useState, useEffect } from "react";
import { Table, message, Input } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { SearchOutlined } from "@ant-design/icons";

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
  const [searchText, setSearchText] = useState("");
  const { isLoggedIn, role, checkAuthState } = useAuthState();

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (isLoggedIn && role === "ADMIN") {
        setLoading(true);
        try {
          const accessToken = localStorage.getItem("accessToken");
          const response = await axios.get(
            `https://sep490-backend-production.up.railway.app/api/v1/user/list?page=1&size=10&search=${searchText}`,
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
      }
    };

    fetchStudents();
  }, [isLoggedIn, role, searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
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
      <h1 className="text-2xl font-bold mb-4">Danh sách thiếu nhi thánh thể</h1>
      <Input
      placeholder="Tìm kiếm theo tên"
      prefix={<SearchOutlined />}
      onChange={(e) => handleSearch(e.target.value)}
      style={{ width: 200, marginBottom: 16 }}
    />
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
};export default AdminStudentListScreen;

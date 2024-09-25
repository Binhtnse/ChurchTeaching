import React, { useState, useEffect } from "react";
import { Table, message, Input, Dropdown, Button, Menu } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { SearchOutlined, DownOutlined } from "@ant-design/icons";

interface User {
  id: number;
  fullName: string;
  gender: string;
  address: string;
  dob: string;
  phoneNumber: string;
}

const AdminUserListScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const { isLoggedIn, role, checkAuthState } = useAuthState();

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    const fetchUsers = async () => {
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
          setUsers(response.data.data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching users:", error);
          message.error("Failed to load user data");
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [isLoggedIn, role, searchText]);

  const handleDownloadTemplate = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/download-template",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user_template.xlsx"); // You can adjust the file name and extension as needed
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading template:", error);
      message.error("Failed to download template");
    }
  };

  const handleUploadTemplate = async (file: File) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/user/import",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);

      message.success("Template uploaded successfully");
      // Optionally, you can refresh the user list here
      // fetchUsers();
    } catch (error) {
      console.error("Error uploading template:", error);
      message.error("Failed to upload template");
    }
  };

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
      <h1 className="text-2xl font-bold mb-4">Danh sách tai khoan</h1>
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="1" onClick={handleDownloadTemplate}>
              Tải template người dùng
            </Menu.Item>
            <Menu.Item key="2">
              <label htmlFor="upload-template">
                Tải template người dùng lên
              </label>
              <input
                id="upload-template"
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUploadTemplate(file);
                  }
                }}
              />
            </Menu.Item>
          </Menu>
        }
      >
        <Button>
          Tùy chọn <DownOutlined />
        </Button>
      </Dropdown>
      <Input
        placeholder="Tìm kiếm theo tên"
        prefix={<SearchOutlined />}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 200, marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        className="w-full"
        pagination={{
          pageSize: 10,
          total: users.length,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};
export default AdminUserListScreen;

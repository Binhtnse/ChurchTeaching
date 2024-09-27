import React, { useState, useEffect } from "react";
import { Table, message, Input, Dropdown, Button, Menu, Tag } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { SearchOutlined, DownOutlined } from "@ant-design/icons";
import usePageTitle from "../hooks/usePageTitle";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

const AdminUserListScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Danh sách tài khoản", "#4154f1");
  }, [setPageTitle]);

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
            `https://sep490-backend-production.up.railway.app/api/v1/user/list?page=1&size=10&role=${
              roleFilter || ""
            }`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const sortedUsers = response.data.data.sort((a: User, b: User) => {
            const roleOrder = { ADMIN: 0, CATECHIST: 1, PARENT: 2, STUDENT: 3 };
            return (
              roleOrder[a.role as keyof typeof roleOrder] -
              roleOrder[b.role as keyof typeof roleOrder]
            );
          });
          setAllUsers(sortedUsers);
          setUsers(sortedUsers);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching users:", error);
          message.error("Failed to load user data");
          setLoading(false);
        }
      }
    };

    fetchUsers();
  }, [isLoggedIn, role, roleFilter]);

  const roleFilterMenu = (
    <Menu onClick={({ key }) => setRoleFilter(key as string)}>
      <Menu.Item key={null}>Tất cả vai trò</Menu.Item>
      <Menu.Item key="ADMIN">ADMIN</Menu.Item>
      <Menu.Item key="CATECHIST">Giáo lý vien</Menu.Item>
      <Menu.Item key="PARENT">Phụ huynh</Menu.Item>
      <Menu.Item key="STUDENT">Thiếu nhi thánh thể</Menu.Item>
    </Menu>
  );

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
    const filteredUsers = allUsers.filter((user) =>
      user.fullName.toLowerCase().includes(value.toLowerCase())
    );
    setUsers(filteredUsers);
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        let color = "default";
        switch (role) {
          case "ADMIN":
            color = "red";
            break;
          case "CATECHIST":
            color = "green";
            break;
          case "PARENT":
            color = "blue";
            break;
          case "STUDENT":
            color = "orange";
            break;
        }
        return <Tag color={color}>{role}</Tag>;
      },
      sorter: (a: User, b: User) => {
        const roleOrder = { ADMIN: 0, CATECHIST: 1, PARENT: 2, STUDENT: 3 };
        return (
          roleOrder[a.role as keyof typeof roleOrder] -
          roleOrder[b.role as keyof typeof roleOrder]
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "ACTIVE" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách tai khoan</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <Input
            placeholder="Tìm kiếm theo tên"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Dropdown overlay={roleFilterMenu}>
            <Button>
              Filter by Role <DownOutlined />
            </Button>
          </Dropdown>
        </div>
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
      </div>
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

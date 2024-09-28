import React, { useState, useEffect, useCallback } from "react";
import {
  Table as AntTable,
  message,
  Input,
  Dropdown,
  Button,
  Menu,
  Tag,
  Pagination,
  Modal,
  Upload,
} from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { SearchOutlined, DownOutlined, InboxOutlined } from "@ant-design/icons";
import usePageTitle from "../hooks/usePageTitle";
import * as Excel from "xlsx";

const { Dragger } = Upload;

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [excelData, setExcelData] = useState<unknown>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Danh sách tài khoản", "#4154f1");
  }, [setPageTitle]);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const fetchUsers = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (isLoggedIn && role === "ADMIN") {
        setLoading(true);
        try {
          const accessToken = localStorage.getItem("accessToken");
          const response = await axios.get(
            `https://sep490-backend-production.up.railway.app/api/v1/user/list?page=${page}&size=${pageSize}&role=${
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
          setPagination((prevPagination) => ({
            ...prevPagination,
            total: response.data.totalElements || sortedUsers.length,
            current: page,
            pageSize: pageSize,
          }));
          setLoading(false);
        } catch (error) {
          console.error("Error fetching users:", error);
          message.error("Failed to load user data");
          setLoading(false);
        }
      }
    },
    [isLoggedIn, role, roleFilter]
  );

  useEffect(() => {
    fetchUsers(1, pagination.pageSize);
  }, [roleFilter, fetchUsers, pagination.pageSize]);

  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchUsers(page, pageSize || pagination.pageSize);
  };

  const roleFilterMenu = (
    <Menu onClick={({ key }) => setRoleFilter(key as string)}>
      <Menu.Item key={null}>Tất cả vai trò</Menu.Item>
      <Menu.Item key="ADMIN">ADMIN</Menu.Item>
      <Menu.Item key="CATECHIST">Giáo lý viên</Menu.Item>
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
      link.setAttribute("download", "user_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading template:", error);
      message.error("Failed to download template");
    }
  };

  const handleUploadTemplate = async (file: File) => {
    setIsUploading(true);
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
      fetchUsers();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error uploading template:", error);
      message.error("Failed to upload template");
    } finally {
      setIsUploading(false);
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
        let displayRole = role;
        switch (role) {
          case "ADMIN":
            color = "red";
            displayRole = "ADMIN";
            break;
          case "CATECHIST":
            color = "green";
            displayRole = "GIÁO LÝ VIÊN";
            break;
          case "PARENT":
            color = "blue";
            displayRole = "PHỤ HUYNH";
            break;
          case "STUDENT":
            color = "orange";
            displayRole = "THIẾU NHI THÁNH THỂ";
            break;
        }
        return <Tag color={color}>{displayRole}</Tag>;
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
      <h1 className="text-2xl font-bold mb-4">Danh sách tài khoản</h1>
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
              Lọc theo vai trò <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="1" onClick={handleDownloadTemplate}>
                Tải template người dùng
              </Menu.Item>
              <Menu.Item key="2" onClick={() => setIsModalVisible(true)}>
                Tải template người dùng lên
              </Menu.Item>
            </Menu>
          }
        >
          <Button>
            Tùy chọn <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <AntTable
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        className="w-full"
        pagination={false}
      />
      <Pagination
        current={pagination.current}
        total={pagination.total}
        pageSize={pagination.pageSize}
        onChange={handlePaginationChange}
        showSizeChanger
        showQuickJumper
        showTotal={(total) => `Total ${total} items`}
        className="mt-4 text-right"
      />
      <Modal
        title="Tải template người dùng lên"
        visible={isModalVisible}
        onOk={() => {
          if (excelData instanceof File) {
            handleUploadTemplate(excelData);
          }
        }}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isUploading}
        okText={isUploading ? "Đang tải lên..." : "Tải lên"}
        width={1000} // Increase the width
        style={{ top: 20 }} // Position the modal closer to the top of the screen
        bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
      >
        <Dragger
          name="file"
          multiple={false}
          showUploadList={false}
          customRequest={({ file, onSuccess, onError }) => {
            if (file instanceof File && file.name.endsWith(".xlsx")) {
              const reader = new FileReader();
              reader.onload = (event) => {
                if (file.name.length > 50) {
                  message.error(
                    `Tên file quá dài, vui lòng chọn một tên file ngắn hơn.`
                  );
                  onError?.(
                    new Error(
                      "Tên file quá dài, vui lòng chọn một tên file ngắn hơn."
                    )
                  );
                  return;
                }
                const maxSize = 45 * 1024 * 1024;
                if (file.size > maxSize) {
                  message.error(
                    `Kích thước file quá lớn, vui lòng chọn một file nhỏ hơn`
                  );
                  onError?.(
                    new Error(
                      "Kích thước file quá lớn, vui lòng chọn một file nhỏ hơn."
                    )
                  );
                  return;
                }
                if (event.target && event.target.result) {
                  const arrayBuffer = event.target.result as ArrayBuffer;
                  const data = new Uint8Array(arrayBuffer);
                  const workbook = Excel.read(data, { type: "array" });
                  const firstSheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[firstSheetName];
                  const jsonData = Excel.utils.sheet_to_json(worksheet);
                  setExcelData(file);
                  setPreviewData(jsonData as Record<string, unknown>[]);
                  if (onSuccess) {
                    onSuccess("ok");
                  }
                } else {
                  console.error("Không tìm thấy file");
                }
              };
              reader.readAsArrayBuffer(file);
            } else {
              if (onError) {
                message.error(
                  `File sai định dạng, làm ơn chọn định danh .xlsx.`
                );
                onError?.(
                  new Error("File sai định dạng, làm ơn chọn định danh .xlsx .")
                );
              }
            }
          }}
          onChange={(info) => {
            if (info.file.status === "done") {
              message.success(`${info.file.name} Tải file lên thành công.`);
            } else if (info.file.status === "error") {
              message.error(`${info.file.name} Tải file lên thất bại.`);
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single upload. Strictly prohibited from uploading
            company data or other banned files.
          </p>
        </Dragger>
        {previewData.length > 0 && (
          <div className="mt-4">
            <h3>File Preview:</h3>
            <AntTable
              dataSource={previewData}
              columns={Object.keys(previewData[0]).map((key) => ({
                title: key,
                dataIndex: key,
                key: key,
              }))}
              pagination={false}
              scroll={{ x: true, y: 300 }}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
export default AdminUserListScreen;

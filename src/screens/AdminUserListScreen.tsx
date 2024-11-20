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
  Tabs,
  Space,
  Form,
  Select,
  DatePicker,
} from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { SearchOutlined, DownOutlined, InboxOutlined } from "@ant-design/icons";
import usePageTitle from "../hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

const { Dragger } = Upload;

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

interface NewUser {
  fullName: string;
  email: string;
  dob: string;
  address: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  role: "ADMIN" | "CATECHIST" | "PARENT" | "STUDENT";
}

interface UserImportData {
  fatherName: string;
  fatherSaintName: string;
  motherName: string;
  motherSaintName: string;
  parentEmail: string;
  parentPhoneNumber: string;
  childName: string;
  childGender: string;
  childDob: string;
  childSaintName: string;
  baptismDate: string;
  baptismChurch: string;
  firstCommunionDate: string;
  firstCommunionChurch: string;
  confirmationDate: string;
  confirmationBishop: string;
  gradeName: string;
  error?: string;
}

const columnTitleMap: { [key: string]: string } = {
  fatherName: "Tên cha",
  fatherSaintName: "Tên thánh cha",
  motherName: "Tên mẹ",
  motherSaintName: "Tên thánh mẹ",
  parentEmail: "Email phụ huynh",
  parentPhoneNumber: "Số điện thoại phụ huynh",
  childName: "Tên con",
  childGender: "Giới tính",
  childDob: "Ngày sinh",
  childSaintName: "Tên thánh con",
  baptismDate: "Ngày rửa tội",
  baptismChurch: "Nhà thờ rửa tội",
  firstCommunionDate: "Ngày rước lễ lần đầu",
  firstCommunionChurch: "Nhà thờ rước lễ lần đầu",
  confirmationDate: "Ngày thêm sức",
  confirmationBishop: "Đức Giám Mục thêm sức",
  gradeName: "Tên khối",
  error: "Lỗi",
};

interface ValidationResponse {
  invalidRecords: UserImportData[];
  validRecords: UserImportData[];
}

const AdminUserListScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [validRecords, setValidRecords] = useState<UserImportData[]>([]);
  const [invalidRecords, setInvalidRecords] = useState<UserImportData[]>([]);
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserForm] = Form.useForm();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { setPageTitle } = usePageTitle();
  console.log(allUsers);

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
          const roleParam = roleFilter ? `&role=${roleFilter}` : "";
          const response = await axios.get(
            `https://sep490-backend-production.up.railway.app/api/v1/user/list?page=${page}&size=${pageSize}${roleParam}&fullName=${searchTerm}`,
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
            total: response.data.pageResponse.totalPage * pageSize,
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
    [isLoggedIn, role, roleFilter, searchTerm]
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchUsers(1, pagination.pageSize);
  };

  useEffect(() => {
    fetchUsers(1, pagination.pageSize);
  }, [roleFilter, fetchUsers, pagination.pageSize, searchTerm]);

  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchUsers(page, pageSize || pagination.pageSize);
  };

  const roleFilterMenu = (
    <Menu onClick={({ key }) => setRoleFilter(key as string)}>
      <Menu.Item key="">Tất cả vai trò</Menu.Item>
      <Menu.Item key="ADMIN">ADMIN</Menu.Item>
      <Menu.Item key="CATECHIST">Giáo lý viên</Menu.Item>
      <Menu.Item key="PARENT">Phụ huynh</Menu.Item>
      <Menu.Item key="STUDENT">Thiếu nhi thánh thể</Menu.Item>
    </Menu>
  );

  const invalidRecordsColumns = [
    {
      title: columnTitleMap['fatherName'],
      dataIndex: 'fatherName',
      key: 'fatherName',
    },
    {
      title: columnTitleMap['fatherSaintName'],
      dataIndex: 'fatherSaintName',
      key: 'fatherSaintName',
    },
    {
      title: columnTitleMap['motherName'],
      dataIndex: 'motherName',
      key: 'motherName',
    },
    {
      title: columnTitleMap['motherSaintName'],
      dataIndex: 'motherSaintName',
      key: 'motherSaintName',
    },
    {
      title: columnTitleMap['parentEmail'],
      dataIndex: 'parentEmail',
      key: 'parentEmail',
    },
    {
      title: columnTitleMap['parentPhoneNumber'],
      dataIndex: 'parentPhoneNumber',
      key: 'parentPhoneNumber',
    },
    {
      title: columnTitleMap['childName'],
      dataIndex: 'childName',
      key: 'childName',
    },
    {
      title: columnTitleMap['childGender'],
      dataIndex: 'childGender',
      key: 'childGender',
    },
    {
      title: columnTitleMap['childDob'],
      dataIndex: 'childDob',
      key: 'childDob',
    },
    {
      title: columnTitleMap['error'],
      dataIndex: 'error',
      key: 'error',
    }
  ];  

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
      message.error("Tải template thất bại");
    }
  };

  const handleCreateUser = async (values: NewUser) => {
    setIsCreatingUser(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/user",
        values,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success("Tạo người dùng thành công");
      setIsAddUserModalVisible(false);
      newUserForm.resetFields();
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error creating user:", error);
      message.error("Tạo người dùng thất bại");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleUploadTemplate = async (file: File) => {
    setIsUploading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);

      const validationResponse = await axios.post<ValidationResponse>(
        "https://sep490-backend-production.up.railway.app/api/user/validate",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const filteredInvalidRecords = validationResponse.data.invalidRecords.filter(record => 
        Object.values(record).some(value => 
          value !== "" && value !== record.error
        )
      );

      setValidRecords(validationResponse.data.validRecords);
      setInvalidRecords(filteredInvalidRecords);
      message.success("Xác thực thông tin thành công");
    } catch (error) {
      console.error("Error validating file:", error);
      message.error("Xác thực thông tin thất bại");
    } finally {
      setIsUploading(false);
    }
  };
  

  const handleImportUsers = async () => {
    setIsUploading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/user/import",
        validRecords.map((record) => ({
          ...record,
          gradeName: record.gradeName || "", // Ensure gradeName is included
        })),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      message.success("Tải lên thành công");
      fetchUsers();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error importing users:", error);
      message.error("Tải lên thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(
        `https://sep490-backend-production.up.railway.app/api/v1/user?id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success("Xóa người dùng thành công");
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Không thể xóa người dùng");
    }
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
        const displayStatus = status === "ACTIVE" ? "Đang hoạt động" : status;
        return <Tag color={color}>{displayStatus}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: User) => (
        <Space>
          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Danh sách tài khoản
      </h1>
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <Input
            placeholder="Tìm kiếm theo tên"
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => handleSearch(e.target.value)}
            onPressEnter={(e) =>
              handleSearch((e.target as HTMLInputElement).value)
            }
            className="w-64"
          />
          <Dropdown overlay={roleFilterMenu}>
            <Button>
              Lọc theo vai trò <DownOutlined className="ml-2" />
            </Button>
          </Dropdown>
          <Button type="primary" onClick={() => setIsAddUserModalVisible(true)}>
            Thêm người dùng
          </Button>
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
          <Button className="flex items-center">
            Tùy chọn <DownOutlined className="ml-2" />
          </Button>
        </Dropdown>
      </div>
      <AntTable
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        className="w-full bg-white rounded-lg shadow"
        pagination={false}
        onRow={(record) => ({
          onClick: () => navigate(`/account/${record.id}`),
          style: { cursor: "pointer" },
        })}
      />
      <Pagination
        current={pagination.current}
        total={pagination.total}
        pageSize={pagination.pageSize}
        onChange={handlePaginationChange}
        showSizeChanger
        showQuickJumper
        showTotal={(total) => `Tổng ${total} mục`}
        className="mt-6 text-right"
      />
      <Modal
        title={
          <h2 className="text-2xl font-semibold">
            Tải template người dùng lên
          </h2>
        }
        visible={isModalVisible}
        onOk={handleImportUsers}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isUploading}
        okText={isUploading ? "Đang tải lên..." : "Tải lên"}
        okButtonProps={{ disabled: invalidRecords.length > 0 }}
        width={1000}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
        className="rounded-lg"
      >
        <Dragger
          name="file"
          multiple={false}
          showUploadList={false}
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8"
          customRequest={({ file, onSuccess, onError }) => {
            if (file instanceof File && file.name.endsWith(".xlsx")) {
              handleUploadTemplate(file);
              onSuccess?.("ok");
            } else {
              message.error(`File sai định dạng, làm ơn chọn định danh .xlsx.`);
              onError?.(
                new Error("File sai định dạng, làm ơn chọn định danh .xlsx .")
              );
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
          <p className="ant-upload-drag-icon text-4xl text-blue-500">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text text-lg font-semibold mt-4">
            Click hoặc kéo file vào đây để tải lên
          </p>
          <p className="ant-upload-hint text-gray-500 mt-2">
            Hỗ trợ tải lên một file duy nhất. Nghiêm cấm tải lên dữ liệu công ty
            hoặc các file bị cấm khác.
          </p>
        </Dragger>
        {(validRecords.length > 0 || invalidRecords.length > 0) && (
          <div className="mt-8 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-blue-600 px-4 pt-4">
              Xem trước nội dung tải lên
            </h3>
            <Tabs
              defaultActiveKey="1"
              type="card"
              className="mx-4"
              items={[
                {
                  key: "1",
                  label: (
                    <span className="px-2">
                      <Tag color="green">Hợp lệ ({validRecords.length})</Tag>
                    </span>
                  ),
                  children: (
                    <div className="border rounded-b-lg p-4">
                      <AntTable<UserImportData>
                        dataSource={validRecords}
                        columns={Object.keys(validRecords[0] || {}).map(
                          (key) => ({
                            title: columnTitleMap[key] || key,
                            dataIndex: key,
                            key: key,
                            ellipsis: true,
                            render: (text, record, index) => {
                              console.log(`Rendering row ${index}:`, record);
                              return text;
                            }                           
                          })
                        )}
                        pagination={false}
                        scroll={{ x: true, y: 300 }}
                        size="small"
                        className="border rounded-lg"
                      />
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <span className="px-2">
                      <Tag color="red">
                        Không hợp lệ ({invalidRecords.length})
                      </Tag>
                    </span>
                  ),
                  children: (
                    <div className="border rounded-b-lg p-4">
                      <AntTable<UserImportData>
                        dataSource={invalidRecords}
                        columns={invalidRecordsColumns}
                        pagination={false}
                        scroll={{ x: true, y: 300 }}
                        size="small"
                        className="border rounded-lg"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
      <Modal
        title="Thêm người dùng mới"
        visible={isAddUserModalVisible}
        onCancel={() => setIsAddUserModalVisible(false)}
        footer={null}
      >
        <Form form={newUserForm} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dob"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select>
              <Select.Option value="MALE">Nam</Select.Option>
              <Select.Option value="FEMALE">Nữ</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select>
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="CATECHIST">Giáo lý viên</Select.Option>
              <Select.Option value="PARENT">Phụ huynh</Select.Option>
              <Select.Option value="STUDENT">Thiếu nhi thánh thể</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreatingUser}
              block
            >
              {isCreatingUser ? "Đang tạo..." : "Tạo người dùng"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default AdminUserListScreen;

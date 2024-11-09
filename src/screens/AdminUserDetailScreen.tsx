import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Spin,
  message,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
} from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import usePageTitle from "../hooks/usePageTitle";
import { useParams } from "react-router-dom";
import ForbiddenScreen from "./ForbiddenScreen";

const { Option } = Select;

interface UserData {
  id: number;
  fullName: string;
  email: string;
  dob: string;
  address: string;
  gender: string;
  phoneNumber: string;
  role: string;
  status: string;
}

const AdminUserDetailScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const { isLoggedIn, role } = useAuthState();
  const [form] = Form.useForm();
  const { setPageTitle } = usePageTitle();
  const { id } = useParams();

  useEffect(() => {
    setPageTitle("Chi tiết tài khoản", "#4154f1");
  }, [setPageTitle]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn && role === "ADMIN") {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(
            `https://sep490-backend-production.up.railway.app/api/v1/user?id=${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUserData(response.data.data);
          form.setFieldsValue(response.data.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          message.error("Không thể tải dữ liệu người dùng");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [id, isLoggedIn, role, form]);

  const handleEdit = async (values: Partial<UserData>) => {
    try {
      const token = localStorage.getItem("accessToken");
      const updateData = {
        ...values,
        id: Number(id),
      };

      await axios.put(
        `https://sep490-backend-production.up.railway.app/api/v1/user?id=${id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Cập nhật thông tin thành công");
      setIsEditModalVisible(false);
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/user?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Cập nhật thông tin thất bại");
    }
  };

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  if (loading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center h-screen"
      />
    );
  }

  if (!userData) {
    return (
      <div className="text-center text-red-500">
        Không tìm thấy thông tin người dùng
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <Card
        title={
          <span className="text-2xl font-semibold text-blue-700">
            Chi tiết tài khoản
          </span>
        }
        className="shadow-xl rounded-lg hover:shadow-2xl transition-shadow duration-300"
        extra={
          <Button
            type="primary"
            onClick={() => setIsEditModalVisible(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Chỉnh sửa thông tin
          </Button>
        }
      >
        <Descriptions
          bordered
          column={1}
          labelStyle={{
            fontWeight: "bold",
            backgroundColor: "#f0f7ff",
            width: "30%",
          }}
          contentStyle={{ backgroundColor: "white" }}
        >
          <Descriptions.Item label="Họ tên">
            {userData.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {userData.dob}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">
            {userData.address}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {userData.gender === "FEMALE" ? "Nữ" : "Nam"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {userData.phoneNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò"> {userData.role === "CATECHIST"
            ? "Giáo lý viên"
            : userData.role === "PARENT"
              ? "Phụ huynh"
              : userData.role === "STUDENT"
                ? "Thiếu nhi thánh thể"
                : userData.role}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {userData.status === "ACTIVE" ? "Đang hoạt động" : "Không hoạt động"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Chỉnh sửa thông tin người dùng"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleEdit}
          layout="vertical"
          initialValues={userData}
        >
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="MALE">Nam</Option>
              <Option value="FEMALE">Nữ</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Space className="flex justify-end">
            <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600">
              Lưu thay đổi
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUserDetailScreen;

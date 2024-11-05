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
} from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import usePageTitle from "../hooks/usePageTitle";

interface UserData {
  id: number;
  fullName: string;
  email: string;
  dob: string;
  address: string;
  gender: string;
  phoneNumber: string;
}

const AccountDetailScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { isLoggedIn } = useAuthState();
  const [form] = Form.useForm();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Thông tin tài khoản", "#4154f1");
  }, [setPageTitle]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn) {
        try {
          const userString = localStorage.getItem("userLogin");
          const user = userString ? JSON.parse(userString) : null;
          const userId = user?.id;
          const token = localStorage.getItem("accessToken");

          if (userId) {
            const response = await axios.get(
              `https://sep490-backend-production.up.railway.app/api/v1/user?id=${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setUserData(response.data.data);
          } else {
            message.error("Không tìm thấy ID người dùng");
          }
        } catch (error) {
          console.error("Lỗi gọi dữ liệu", error);
          message.error("Không gọi được dữ liệu người dùng");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        message.error("Người dùng chưa đăng nhập");
      }
    };

    fetchUserData();
  }, [isLoggedIn]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleChangePassword = async (values: {
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/user/change-password",
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Thay đổi mật khẩu thành công");
      console.log(response);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Lỗi thay đổi mật khẩu:", error);
      message.error("Thay đổi mật khẩu không thành công");
    }
  };

  if (loading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center h-screen"
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center text-red-500">
        Vui lòng đăng nhập để xem chi tiết tài khoản
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center text-red-500">
        Lấy dữ liệu người dùng không thành công
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <Card
        title={
          <span className="text-2xl font-semibold text-blue-700">
            Thông tin tài khoản
          </span>
        }
        className="shadow-xl rounded-lg hover:shadow-2xl transition-shadow duration-300"
      >
        <Descriptions
          bordered
          column={1}
          labelStyle={{
            fontWeight: "bold",
            backgroundColor: "#f0f7ff",
            width: "30%",
          }}
          contentStyle={{
            backgroundColor: "white",
          }}
          className="custom-descriptions"
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
        </Descriptions>
        <Button
          type="primary"
          onClick={showModal}
          className="mt-6 bg-blue-600 hover:bg-blue-700 transition-colors duration-300 h-10 px-6"
        >
          Thay đổi mật khẩu
        </Button>
      </Card>

      <Modal
        title={<span className="text-xl text-blue-700">Thay đổi mật khẩu</span>}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="custom-modal"
      >
        <Form
          form={form}
          onFinish={handleChangePassword}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="oldPassword"
            label={<span className="font-medium">Mật khẩu cũ</span>}
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
          >
            <Input.Password className="h-10" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={<span className="font-medium">Mật khẩu mới</span>}
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password className="h-10" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={<span className="font-medium">Xác nhận mật khẩu mới</span>}
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng nhập lại mật khẩu mới!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu không trùng khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password className="h-10" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700 h-10 px-6"
            >
              Thay đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountDetailScreen;

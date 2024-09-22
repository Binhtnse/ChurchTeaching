import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Image } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "../hooks/useAuthState";

const { Title } = Typography;

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setRole, setUserName } = useAuthState();

  const onFinish = async (values: { account: string; password: string }) => {
    try {
      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/user/login",
        {
          account: values.account,
          password: values.password,
        }
      );
      console.log("Login successful:", response.data);
      message.success("Đăng nhập thành công!");

      if (response.data.data && response.data.data.userLogin) {
        localStorage.setItem(
          "userLogin",
          JSON.stringify(response.data.data.userLogin)
        );
        localStorage.setItem("accessToken", response.data.data.accessToken);
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      } else {
        console.error("Unexpected response structure:", response.data);
      }

      setIsLoggedIn(true);
      setRole(response.data.data.userLogin.roleName?.toUpperCase() || "");
      setUserName(response.data.data.userLogin.name || "");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      message.error("Đăng nhập thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/2 h-screen md:h-full">
        <Image
          src="https://img.texasmonthly.com/2023/07/texas-painted-churches-1.jpg?auto=compress&crop=faces&fit=fit&fm=jpg&h=0&ixlib=php-3.3.1&q=45&w=1250"
          alt="Church"
          className="object-cover w-full h-screen"
        />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md">
          <Title level={2} className="text-center mb-8">
            Đăng nhập
          </Title>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="account"
              rules={[
                { required: true, message: "Vui lòng nhập tên tài khoản!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên tài khoản" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

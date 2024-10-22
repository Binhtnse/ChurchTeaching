import React from "react";
import { Layout, Button, Typography, Space, Dropdown, Menu } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC<{ isLoggedIn: boolean; userName: string }> = ({ isLoggedIn, userName }) => {
  const navigate = useNavigate();

  const handleMenuClick = async (e: { key: string }) => {
    if (e.key === "login") {
      navigate("/login");
    } else if (e.key === "logout") {
      try {
        await axios.post(
          "https://sep490-backend-production.up.railway.app/api/v1/user/logout"
        );
        // Clear user data from localStorage
        localStorage.removeItem("userLogin");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        // You might want to show an error message to the user here
      }
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {isLoggedIn ? (
        <Menu.Item key="logout">Logout</Menu.Item>
      ) : (
        <Menu.Item key="login">Login</Menu.Item>
      )}
    </Menu>
  );

  return (
    <AntHeader className="bg-[#2F6FC8] flex items-center justify-between px-4">
      <Space className="flex items-center">
        <img
          src="src\assets\vecteezy_cross-christian_1194154.png"
          alt="Church Logo"
          className="h-8 w-8 mr-2"
        />
        <Title level={4} className="m-0 text-white">
          Church Teaching
        </Title>
      </Space>
      <Space>
        <Button
          icon={<BellOutlined />}
          className="mr-2"
          onClick={() => {
            /* Handle notifications */
          }}
        />
        <Dropdown overlay={menu} placement="bottomRight">
          <Button icon={<UserOutlined />}>
          {isLoggedIn ? userName || "Account" : "Login"}
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;

import React from "react";
import { Layout, Button, Typography, Space, Dropdown, Menu } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC<{ isLoggedIn: boolean; userName: string }> = ({ isLoggedIn, userName }) => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setRole, setUserName } = useAuthState();

  const handleMenuClick = async (e: { key: string }) => {
    if (e.key === "logout") {
      try {
        await axios.post(
          "https://sep490-backend-production.up.railway.app/api/v1/user/logout",
          {},      
        );
        localStorage.clear();
        setIsLoggedIn(false);
        setRole("GUEST");
        setUserName("");
        window.location.href = "/";
      } catch (error) {
        console.error("Logout failed:", error);
      }
    } else if (e.key === "account") {
      navigate("/account");
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="account">Thông tin tài khoản</Menu.Item>
      <Menu.Item key="logout">Đăng xuất</Menu.Item>
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
          Nhà thờ giáo xứ Phước Vĩnh
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
        {isLoggedIn ? (
          <Dropdown overlay={menu} placement="bottomRight">
            <Button icon={<UserOutlined />}>
              {userName || "Account"}
            </Button>
          </Dropdown>
        ) : (
          <Button 
            icon={<UserOutlined />}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </Button>
        )}
      </Space>
    </AntHeader>
  );
};

export default Header;

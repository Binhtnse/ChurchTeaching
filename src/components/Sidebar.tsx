import React from "react";
import { BookOutlined, HomeOutlined, UnlockOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "home",
    label: "Trang chủ",
    icon: <HomeOutlined />,
  },
  {
    type: "divider",
    style: { color: "black" },
  },
  {
    key: "syllabus",
    label: "Giáo trình",
    icon: <BookOutlined />,
  },
  {
    type: "divider",
  },
  {
    key: "login",
    label: "Đăng nhập",
    icon: <UnlockOutlined />,
  },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const onClick: MenuProps["onClick"] = (e) => {
    if (e.key === "login") {
      navigate("/login");
    } else {
      console.log("click ", e);
    }
  };

  return (
    <div style={{ height: '100vh', width: '256px', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
      <div style={{ backgroundColor: '#D60A0B', height: '100px', width: '100%' }}></div>
      <Menu
        onClick={onClick}
        style={{
          backgroundColor: "#14238A",
          color: "white",
          height: 'calc(100% - 50px)',
          width: "100%",
        }}
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        items={items}
        theme="dark"
      />
    </div>
  );
};

export default Sidebar;

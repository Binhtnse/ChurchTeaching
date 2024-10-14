import React, { useState } from "react";
import {
  BookOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  HistoryOutlined,
  FormOutlined,
  SolutionOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Button } from "antd";
import { useNavigate } from "react-router-dom";

type MenuItem = Required<MenuProps>["items"][number];

const getMenuItems = (role: string): MenuItem[] => {
  const commonItems: MenuItem[] = [
    {
      key: "",
      label: "Trang chủ",
      icon: <HomeOutlined />,
    },
    {
      type: "divider",
      style: { color: "black" },
    },
  ];

  const roleSpecificItems: Record<string, MenuItem[]> = {
    STUDENT: [
      {
        key: "student-schedule",
        label: "Lịch học",
        icon: <CalendarOutlined />,
      },
      {
        key: "progress",
        label: "Tiến độ học tập",
        icon: <HistoryOutlined />,
        children: [
          { key: "study-grades", label: "Xem điểm" },
          { key: "study-attendance", label: "Xem điểm danh" },
        ],
      },
    ],
    CATECHIST: [
      {
        key: "classes",
        label: "Lớp học",
        icon: <TeamOutlined />,
      },
      {
        key: "schedule",
        label: "Lịch giảng dạy",
        icon: <CalendarOutlined />,
      },
    ],
    PARENT: [
      {
        key: "timetable",
        label: "Thời khóa biểu",
        icon: <CalendarOutlined />,
      },
      {
        key: "progress",
        label: "Tiến độ học tập",
        icon: <HistoryOutlined />,
        children: [
          { key: "study-grades", label: "Xem điểm" },
          { key: "study-attendance", label: "Xem điểm danh" },
        ],
      },
      {
        key: "enroll",
        label: "Đăng ký học",
        icon: <FormOutlined />,
      },
    ],
    ADMIN: [
      {
        key: "user-list",
        label: "Quản lý tài khoản",
        icon: <TeamOutlined />,
      },
      {
        key: "enroll-list",
        label: "Danh sách đăng ký học",
        icon: <TeamOutlined />,
      },
      {
        key: "class-list",
        label: "Quản lý lớp học",
        icon: <SolutionOutlined />,
      },
      {
        key: "syllabus",
        label: "Quản lý giáo trình",
        icon: <BookOutlined />,
        children: [
          { key: "list-syllabus", label: "Xem tất cả giáo trình" },
          { key: "add-syllabus", label: "Tạo giáo trình" },
        ],
      },
      {
        key: "admin-student-list",
        label: "Quản lý danh sách thiếu nhi",
        icon: <SolutionOutlined />,
      },
      {
        key: "policy",
        label: "Quản lý các quy định",
        icon: <SolutionOutlined />,
        children: [
          { key: "policy-list", label: "Xem tất cả quy định" },
          { key: "add-policy", label: "Thêm quy định" },
        ],
      },
    ],
    GUEST: [
      {
        key: "enroll",
        label: "Đăng ký học",
        icon: <FormOutlined />,
      },
    ],
  };

  const validRoles = ["STUDENT", "CATECHIST", "PARENT", "ADMIN", "GUEST"];
  const safeRole = validRoles.includes(role.toUpperCase())
    ? role.toUpperCase()
    : "GUEST";

  return [...commonItems, ...(roleSpecificItems[safeRole] || [])];
};

const Sidebar: React.FC<{ role: string }> = ({ role }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onClick: MenuProps["onClick"] = async (e) => {
      navigate(`/${e.key}`);
  };
  const items = getMenuItems(role);

  return (
    <div
      style={{
        width: collapsed ? "80px" : "256px",
        transition: "width 0.3s",
        backgroundColor: "white",
        boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
      }}
    >
      <Button
        type="text"
        onClick={toggleCollapsed}
        style={{
          width: "100%",
          marginBottom: 16,
          textAlign: "left",
          padding: "16px",
        }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
      <Menu
        onClick={onClick}
        style={{
          backgroundColor: "white",
          color: "black",
          height: "calc(100% - 64px)",
          width: "100%",
          border: "none",
        }}
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        items={items}
        inlineCollapsed={collapsed}
      />
    </div>
  );
};

export default Sidebar;

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
  AccountBookOutlined,
  SafetyOutlined,
  UsergroupAddOutlined,
  SnippetsOutlined,
  CreditCardOutlined,
  AreaChartOutlined,
  FileDoneOutlined,
  ReadOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Button } from "antd";
import { useNavigate } from "react-router-dom";

type MenuItem = Required<MenuProps>["items"][number];

const getMenuItems = (role: string): MenuItem[] => {
  const roleSpecificItems: Record<string, MenuItem[]> = {
    STUDENT: [
      {
        key: "",
        label: "Trang chủ",
        icon: <HomeOutlined />,
      },
      {
        type: "divider",
        style: { color: "black" },
      },
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
      {
        key: "transaction-pay-children",
        label: "Đóng học phí",
        icon: <CreditCardOutlined />,
      },
      {
        key: "transaction-history-user",
        label: "Lịch sử giao dịch",
        icon: <AccountBookOutlined />,
      },
    ],
    CATECHIST: [
      {
        key: "",
        label: "Trang chủ",
        icon: <HomeOutlined />,
      },
      {
        type: "divider",
        style: { color: "black" },
      },
      {
        key: "classes-catechist",
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
        key: "",
        label: "Trang chủ",
        icon: <HomeOutlined />,
      },
      {
        type: "divider",
        style: { color: "black" },
      },
      {
        key: "parent-schedule",
        label: "Lịch học của con",
        icon: <CalendarOutlined />,
      },
      {
        key: "progress",
        label: "Tiến độ học tập",
        icon: <HistoryOutlined />,
        children: [
          { key: "study-grades-parent", label: "Xem điểm" },
          { key: "study-attendance-parent", label: "Xem điểm danh" },
        ],
      },
      {
        key: "transaction-pay-parent",
        label: "Đóng học phí",
        icon: <CreditCardOutlined />,
      },
      {
        key: "transaction-history-user",
        label: "Lịch sử giao dịch",
        icon: <AccountBookOutlined />,
      },
      {
        key: "enroll",
        label: "Đăng ký học",
        icon: <FormOutlined />,
      },
    ],
    ADMIN: [
      {
        key: "dashboard",
        label: "Bảng thông tin",
        icon: <AreaChartOutlined />,
      },
      {
        type: "divider",
        style: { color: "black" },
      },
      {
        key: "user-list",
        label: "Quản lý tài khoản",
        icon: <TeamOutlined />,
      },
      {
        key: "enroll-list",
        label: "Danh sách đăng ký học",
        icon: <SnippetsOutlined />,
      },
      {
        key: "class-list",
        label: "Quản lý lớp học",
        icon: <SolutionOutlined />,
      },
      {
        key: "syllabus",
        label: "Quản lý giáo trình",
        icon: <ReadOutlined />,
        children: [
          { key: "list-syllabus", label: "Xem tất cả giáo trình" },
          { key: "add-syllabus", label: "Tạo giáo trình" },
        ],
      },
      {
        key: "post",
        label: "Quản lý bài viết",
        icon: <BookOutlined />,
      },
      {
        key: "admin-student-catechist-list",
        label: "Quản lý thiếu nhi và giáo lý viên",
        icon: <UsergroupAddOutlined />,
        children: [
          { key: "admin-student-list", label: "Quản lý danh sách thiếu nhi" },
          { key: "admin-catechist-list", label: "Quản lý danh sách giáo lý viên" },
        ],
      },
      {
        key: "transaction-history",
        label: "Lịch sử giao dịch",
        icon: <AccountBookOutlined />,
      },
      {
        key: "leave-request-history",
        label: "Danh sách đơn xin nghỉ",
        icon: <FileDoneOutlined />,
      },
      {
        key: "policy",
        label: "Quản lý các quy định",
        icon: <SafetyOutlined />,
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

  return [...(roleSpecificItems[safeRole] || [])];
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
        width: collapsed ? "80px" : "300px",
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

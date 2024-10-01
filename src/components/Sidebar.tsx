import React from "react";
import {
  BookOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  UnlockOutlined,
  LogoutOutlined,
  HistoryOutlined,
  FormOutlined,
  UserOutlined,
  SolutionOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type MenuItem = Required<MenuProps>["items"][number];

const getMenuItems = (role: string, isLoggedIn: boolean): MenuItem[] => {
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
        key: "assignments",
        label: "Bài tập",
        icon: <BookOutlined />,
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
        key: "account",
        label: "Tài khoản",
        icon: <UserOutlined />,
      },
    ],
    CATECHIST: [
      {
        key: "classes",
        label: "Lớp học",
        icon: <TeamOutlined />,
        children: [
          { key: "student-list", label: "Danh sách thiếu nhi" },
          { key: "catechist-attendance", label: "Xem điểm danh" },
        ],
      },
      {
        key: "grading",
        label: "Chấm điểm",
        icon: <BookOutlined />,
      },
      {
        key: "account",
        label: "Tài khoản",
        icon: <UserOutlined />,
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
      {
        key: "account",
        label: "Tài khoản",
        icon: <UserOutlined />,
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
    ],
    GUEST: [
      {
        key: "enroll",
        label: "Đăng ký học",
        icon: <FormOutlined />,
      },
    ],
  };

  const authItem: MenuItem = {
    key: isLoggedIn ? "logout" : "login",
    label: isLoggedIn ? "Đăng xuất" : "Đăng nhập",
    icon: isLoggedIn ? <LogoutOutlined /> : <UnlockOutlined />,
  };

  const validRoles = ["STUDENT", "CATECHIST", "PARENT", "ADMIN", "GUEST"];
  const safeRole = validRoles.includes(role.toUpperCase())
    ? role.toUpperCase()
    : "GUEST";

  return [...commonItems, ...(roleSpecificItems[safeRole] || []), authItem];
};

const Sidebar: React.FC<{ role: string; isLoggedIn: boolean }> = ({
  role,
  isLoggedIn,
}) => {
  const navigate = useNavigate();

  const onClick: MenuProps["onClick"] = async (e) => {
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
    } else {
      navigate(`/${e.key}`);
    }
  };
  const items = getMenuItems(role, isLoggedIn);

  return (
    <div
      style={{
        height: "100vh",
        width: "256px",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{ backgroundColor: "#D60A0B", height: "100px", width: "100%" }}
      ></div>
      <Menu
        onClick={onClick}
        style={{
          backgroundColor: "#14238A",
          color: "white",
          height: "calc(100% - 50px)",
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

import React from "react";
import { BookOutlined, HomeOutlined, CalendarOutlined, TeamOutlined, SettingOutlined, UnlockOutlined, LogoutOutlined, HistoryOutlined, FormOutlined} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

type MenuItem = Required<MenuProps>["items"][number];

const getMenuItems = (role: string, isLoggedIn: boolean): MenuItem[] => {
  const commonItems: MenuItem[] = [
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
  ];

  const roleSpecificItems: Record<string, MenuItem[]> = {
    STUDENT: [
      {
        key: "assignments",
        label: "Bài tập",
        icon: <BookOutlined />,
      },
    ],
    CATECHIST: [
      {
        key: "classes",
        label: "Lớp học",
        icon: <TeamOutlined />,
      },
      {
        key: "grading",
        label: "Chấm điểm",
        icon: <BookOutlined />,
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
      },
      {
        key: "enroll",
        label: "Đăng ký học",
        icon: <FormOutlined />,
      },
    ],
    ADMIN: [
      {
        key: "users",
        label: "Quản lý người dùng",
        icon: <TeamOutlined />,
      },
      {
        key: "settings",
        label: "Cài đặt hệ thống",
        icon: <SettingOutlined />,
      },
    ],
  };

  const authItem: MenuItem = {
    key: isLoggedIn ? "logout" : "login",
    label: isLoggedIn ? "Đăng xuất" : "Đăng nhập",
    icon: isLoggedIn ? <LogoutOutlined /> : <UnlockOutlined />,
  };

  const validRoles = ['STUDENT', 'CATECHIST', 'PARENT', 'ADMIN'];
  const safeRole = validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : '';

  return [
    ...commonItems,
    ...(isLoggedIn && roleSpecificItems[safeRole] ? roleSpecificItems[safeRole] : []),
    authItem
  ];
};

const Sidebar: React.FC<{ role: string; isLoggedIn: boolean }> = ({ role, isLoggedIn }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onClick: MenuProps["onClick"] = (e) => {
    if (e.key === "login") {
      navigate('/login');
    } else if (e.key === "logout") {
      // Clear user data from localStorage
      localStorage.removeItem('userLogin');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch(logout());
      navigate('/login');
    } else {
      navigate(`/${e.key}`);
    }
  };

  const items = getMenuItems(role, isLoggedIn);

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

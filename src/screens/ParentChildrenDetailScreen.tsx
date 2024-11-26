import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table, Tag, Spin, message } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import usePageTitle from "../hooks/usePageTitle";
import { Button } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface ChildHistory {
  yearId: string;
  year: string;
  gradeId: string;
  gradeName: string;
  classId: string;
  className: string;
  result: string;
  gpa: string;
  linkCer: string;
  status: string;
  isTuitioned: string;
}

const ParentChildrenDetailScreen: React.FC = () => {
  const { childId } = useParams();
  const [history, setHistory] = useState<ChildHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, role } = useAuthState();
  const { setPageTitle } = usePageTitle();
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle("Chi tiết học tập", "#4154f1");
  }, [setPageTitle]);

  useEffect(() => {
    const fetchChildHistory = async () => {
      if (!isLoggedIn || role !== "PARENT") return;

      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/get-histody-child/${childId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching child history:", error);
        message.error("Không thể tải lịch sử học tập");
      } finally {
        setLoading(false);
      }
    };

    fetchChildHistory();
  }, [childId, isLoggedIn, role]);

  const columns = [
    {
      title: "Năm học",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "Khối",
      dataIndex: "gradeName",
      key: "gradeName",
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Kết quả",
      dataIndex: "result",
      key: "result",
    },
    {
      title: "Điểm tổng kết",
      dataIndex: "gpa",
      key: "gpa",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "done" ? "green" : "orange";
        const text = status === "done" ? "Hoàn thành" : "Chưa hoàn thành";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Học phí",
      dataIndex: "isTuitioned",
      key: "isTuitioned",
      render: (isTuitioned: string) => {
        const color = isTuitioned === "true" ? "green" : "red";
        const text = isTuitioned === "true" ? "Đã đóng" : "Chưa đóng";
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  if (!isLoggedIn || role !== "PARENT") {
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Button
        type="link"
        icon={<LeftOutlined />}
        onClick={() => navigate("/children-list")}
        className="mb-4"
      >
        Quay lại
      </Button>
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Lịch sử học tập
      </h1>

      <Table
        columns={columns}
        dataSource={history}
        rowKey={(record) => `${record.yearId}-${record.classId}`}
        pagination={false}
        className="w-full bg-white rounded-lg shadow"
      />
    </div>
  );
};

export default ParentChildrenDetailScreen;

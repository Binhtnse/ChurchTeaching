import React, { useState, useEffect } from "react";
import { Table, Tag, Spin, message } from "antd";
import axios from "axios";
import usePageTitle from "../hooks/usePageTitle";

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

interface UserDetails {
  id: number;
  fullName: string;
  email: string | null;
  dob: string;
  address: string | null;
  gender: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  account: string;
}

const StudentStudyHistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<ChildHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { setPageTitle } = usePageTitle();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    setPageTitle("Lịch sử học tập", "#4154f1");
  }, [setPageTitle]);

  const userString = localStorage.getItem("userLogin");
const userId = userString ? JSON.parse(userString).id : null;
const token = localStorage.getItem("accessToken");


useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
  
      try {
        setLoading(true);
  
        // Fetch student history
        const historyResponse = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/get-histody-child/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setHistory(historyResponse.data.data);
  
        // Fetch user details
        const userResponse = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/user?id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (userResponse.data.status === "success") {
          setUserDetails(userResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Không thể tải thông tin");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [userId, token]);

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

  if (loading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center h-screen"
      />
    );
  }

  return (
    <div className="p-8 bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {userDetails && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
              Thông tin cá nhân
            </h1>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">
                    Họ và tên:
                  </span>
                  <span className="text-gray-800">{userDetails.fullName}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">
                    Ngày sinh:
                  </span>
                  <span className="text-gray-800">{userDetails.dob}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">
                    Giới tính:
                  </span>
                  <span className="text-gray-800">
                    {userDetails.gender === "MALE" ? "Nam" : "Nữ"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">
                    Email:
                  </span>
                  <span className="text-gray-800">
                    {userDetails.email || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">
                    Số điện thoại:
                  </span>
                  <span className="text-gray-800">
                    {userDetails.phoneNumber || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-32">
                    Địa chỉ:
                  </span>
                  <span className="text-gray-800">
                    {userDetails.address || "Chưa cập nhật"}
                  </span>
                </div>
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={history}
              rowKey={(record) => `${record.yearId}-${record.classId}`}
              pagination={false}
              className="w-full mt-6"
              rowClassName="hover:bg-blue-50 transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentStudyHistoryScreen;

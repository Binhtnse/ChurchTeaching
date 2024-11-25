import React, { useState, useEffect } from "react";
import { Table, Button, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import usePageTitle from "../hooks/usePageTitle";

interface LeaveRequest {
  leaveRequestId: number;
  requestTime: string;
  reason: string;
  studentName: string;
  className: string;
  statusOfLeave: string;
  studentClass: number;
  timeTableId: number;
  timeTableName: string;
  timeTableTime: string;
}

const CatechistLeaveRequestListScreen: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [approvingIds, setApprovingIds] = useState<number[]>([]);
  const [cancelingIds, setCancelingIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { timeTableId } = useParams<{ timeTableId: string }>();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Danh sách đơn xin nghỉ", "#4154f1");
  }, [setPageTitle]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/leave-requests/catechist/${timeTableId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setLeaveRequests(response.data.data);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [timeTableId]);

  const handleApprove = async (record: LeaveRequest) => {
    setApprovingIds((prev) => [...prev, record.leaveRequestId]);
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.put(
        "https://sep490-backend-production.up.railway.app/api/v1/leave-requests/approve",
        {
          leaveRequestId: record.leaveRequestId,
          timeTableId: record.timeTableId,
          studentClassId: record.studentClass,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Refresh the leave requests list
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/leave-requests/catechist/${timeTableId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setLeaveRequests(response.data.data);
    } catch (error) {
      console.error("Error approving leave request:", error);
    } finally {
      setApprovingIds((prev) =>
        prev.filter((id) => id !== record.leaveRequestId)
      );
    }
  };

  const handleCancel = async (record: LeaveRequest) => {
    setCancelingIds((prev) => [...prev, record.leaveRequestId]);
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.put(
        "https://sep490-backend-production.up.railway.app/api/v1/leave-requests/cancel",
        {
          leaveRequestId: record.leaveRequestId,
          timeTableId: record.timeTableId,
          studentClassId: record.studentClass,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // Refresh the leave requests list
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/leave-requests/catechist/${timeTableId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setLeaveRequests(response.data.data);
    } catch (error) {
      console.error("Error canceling leave request:", error);
    } finally {
      setCancelingIds((prev) =>
        prev.filter((id) => id !== record.leaveRequestId)
      );
    }
  };

  const { weekNumber, date, dayOfWeek, time, classId } = location.state || {};

  const columns = [
    {
      title: "Tên thiếu nhi",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Thời gian xin nghỉ",
      dataIndex: "timeTableTime",
      key: "timeTableTime",
      render: (time: string) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thời gian gửi đơn",
      dataIndex: "requestTime",
      key: "requestTime",
      render: (time: string) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Trạng thái",
      dataIndex: "statusOfLeave",
      key: "statusOfLeave",
      render: (status: string) => {
        switch (status) {
          case "ACTIVE":
            return <span className="text-green-600">Đã duyệt</span>;
          case "PENDING":
            return <span className="text-yellow-600">Chưa duyệt</span>;
          default:
            return status;
        }
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (record: LeaveRequest) => (
        <div className="space-x-2">
          <Button
            type="primary"
            onClick={() => handleApprove(record)}
            disabled={
              record.statusOfLeave === "ACTIVE" ||
              approvingIds.includes(record.leaveRequestId)
            }
            className={`${
              record.statusOfLeave === "ACTIVE"
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
            loading={approvingIds.includes(record.leaveRequestId)}
          >
            {approvingIds.includes(record.leaveRequestId)
              ? "Đang duyệt"
              : "Duyệt đơn"}
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleCancel(record)}
            disabled={
              record.statusOfLeave === "ACTIVE" ||
              cancelingIds.includes(record.leaveRequestId)
            }
            loading={cancelingIds.includes(record.leaveRequestId)}
          >
            {cancelingIds.includes(record.leaveRequestId)
              ? "Đang hủy"
              : "Hủy đơn"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() =>
          navigate(
            `/schedule/attendance/${timeTableId}?dayOfWeek=${dayOfWeek}&weekNumber=${weekNumber}&time=${time}&date=${date}&classId=${classId}`, 
            {
              state: { weekNumber, date, dayOfWeek, time }
            }
          )
        }
        className="mb-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      >
        Quay lại điểm danh
      </Button>

      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Danh sách đơn xin nghỉ
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={leaveRequests}
          rowKey="id"
          className="border border-gray-200 rounded-lg"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} đơn`,
          }}
        />
      )}
    </div>
  );
};

export default CatechistLeaveRequestListScreen;

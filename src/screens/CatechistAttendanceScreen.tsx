import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, message, Typography, Checkbox } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";
import usePageTitle from "../hooks/usePageTitle";
import { useParams, useNavigate } from "react-router-dom";

const { Title } = Typography;

interface AttendanceRecord {
  attendanceId: number;
  studentClass: {
    id: number;
    name: string;
    account: string;
  };
  isAbsent: "PRESENT" | "ABSENT";
  isAbsentWithPermission: "TRUE" | "FALSE";
}

interface AttendanceData {
  timeTableId: number;
  slotName: string;
  attendanceRecords: AttendanceRecord[];
}

const CatechistAttendanceScreen: React.FC = () => {
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [loading, setLoading] = useState(false);
  const { setPageTitle } = usePageTitle();
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const navigate = useNavigate();
  const { timeTableId } = useParams<{ timeTableId: string }>();

  useEffect(() => {
    setPageTitle("Điểm danh", "#4154f1");
  }, [setPageTitle]);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const fetchAttendanceData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/attendance/timetable/${timeTableId}`
      );
      if (response.status === 200) {
        setAttendanceData(response.data.data);
      } else {
        setAttendanceData(null);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      message.error("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  }, [timeTableId]);

  useEffect(() => {
    if (isLoggedIn && role === "CATECHIST" && timeTableId) {
      fetchAttendanceData();
    }
  }, [isLoggedIn, role, timeTableId, fetchAttendanceData]);

  const handleBack = () => {
    navigate("/schedule");
  };

  const handleAttendanceChange = (attendanceId: number, isAbsent: boolean) => {
    setAttendanceData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        attendanceRecords: prevData.attendanceRecords.map(record =>
          record.attendanceId === attendanceId
            ? { ...record, isAbsent: isAbsent ? "ABSENT" : "PRESENT" }
            : record
        )
      };
    });
  };

  const handleSaveAttendance = async () => {
    try {
      // Implement the API call to save attendance here
      console.log("Saving attendance:", attendanceData);
      message.success("Attendance saved successfully");
    } catch (error) {
      console.error("Error saving attendance:", error);
      message.error("Failed to save attendance");
    }
  };

  const columns: ColumnsType<AttendanceRecord> = [
    { title: "STT", dataIndex: ["studentClass", "id"], key: "id" },
    { title: "Tên thiếu nhi", dataIndex: ["studentClass", "name"], key: "name" },
    {
      title: "Điểm danh",
      key: "attendance",
      render: (_, record) => (
        <Checkbox
          checked={record.isAbsent === "PRESENT"}
          onChange={(e) => handleAttendanceChange(record.attendanceId, !e.target.checked)}
        />
      ),
    },
  ];

  if (!isLoggedIn || role !== "CATECHIST") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="mb-4"
      >
        Quay lại lịch dạy
      </Button>
      <Title level={2} className="mb-6 text-center text-gray-800">
        Điểm Danh Thiếu Nhi - {attendanceData?.slotName}
      </Title>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Table
          columns={columns}
          dataSource={attendanceData?.attendanceRecords}
          loading={loading}
          className="border border-gray-200 rounded-lg mb-6"
          pagination={false}
          rowKey="attendanceId"
        />
        <div className="flex justify-end">
          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveAttendance}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Lưu điểm danh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CatechistAttendanceScreen;

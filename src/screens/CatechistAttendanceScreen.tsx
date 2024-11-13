import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, message, Checkbox, Spin } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";
import usePageTitle from "../hooks/usePageTitle";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

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
  const [saveLoading, setSaveLoading] = useState(false);
  const { setPageTitle } = usePageTitle();
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dayOfWeek = searchParams.get("dayOfWeek");
  const weekNumber = searchParams.get("weekNumber");
  const time = searchParams.get("time");
  const date = searchParams.get("date");
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
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/attendance/timetable/${timeTableId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
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
    if (date && isFutureDate(date)) {
      message.warning("Không thể điểm danh cho buổi học chưa diễn ra");
      return;
    }

    setAttendanceData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        attendanceRecords: prevData.attendanceRecords.map((record) =>
          record.attendanceId === attendanceId
            ? { ...record, isAbsent: isAbsent ? "ABSENT" : "PRESENT" }
            : record
        ),
      };
    });
  };

  const handleSaveAttendance = async () => {
    setSaveLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const requestBody = {
        timeTableId: Number(timeTableId),
        studentAttendances: attendanceData?.attendanceRecords.map((record) => ({
          studentClassId: record.studentClass.id,
          isAbsent: record.isAbsent,
        })),
      };

      const response = await axios.put(
        "https://sep490-backend-production.up.railway.app/api/v1/attendance",
        requestBody,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status === 200) {
        message.success("Lưu điểm danh thành công");
      } else {
        throw new Error("Lưu điểm danh thất bại");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      message.error("Lưu điểm danh thất bại");
    } finally {
      setSaveLoading(false);
    }
  };

  const isFutureDate = (dateString: string | null) => {
    if (!dateString) return false;
    const slotDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return slotDate > today;
  };

  const columns: ColumnsType<AttendanceRecord> = [
    { title: "STT", dataIndex: ["studentClass", "id"], key: "id" },
    {
      title: "Tên thiếu nhi",
      dataIndex: ["studentClass", "name"],
      key: "name",
    },
    {
      title: "Trạng thái điểm danh",
      key: "attendance",
      className: "bg-gray-100 font-semibold",
      render: (_, record) => (
        <div className="flex items-center">
          <Checkbox
            checked={record.isAbsent === "PRESENT"}
            onChange={(e) =>
              handleAttendanceChange(record.attendanceId, !e.target.checked)
            }
            disabled={
              record.isAbsentWithPermission === "TRUE" ||
              Boolean(date && isFutureDate(date))
            }
          />
          {record.isAbsentWithPermission === "TRUE" && (
            <span className="ml-2 text-gray-500">Vắng có phép</span>
          )}
          {date && isFutureDate(date) && (
            <span className="ml-2 text-yellow-500">
              Buổi học chưa diễn ra
            </span>
          )}
        </div>
      ),
    },
  ];

  if (!isLoggedIn || role !== "CATECHIST") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="mb-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      >
        Quay lại lịch dạy
      </Button>
      <Button
        onClick={() => navigate(`/leave-requests/${timeTableId}`)}
        className="mb-4 ml-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 border rounded shadow"
      >
        Xem danh sách đơn xin nghỉ
      </Button>
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Điểm Danh Thiếu Nhi - {attendanceData?.slotName} - Tuần {weekNumber},{" "}
        {date}, {dayOfWeek}, {time}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={attendanceData?.attendanceRecords}
            loading={loading}
            className="border border-gray-200 rounded-lg mb-6"
            pagination={false}
            rowKey="attendanceId"
          />
        )}
        <div className="flex justify-end">
          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveAttendance}
            loading={saveLoading}
            disabled={Boolean(date && isFutureDate(date))}
            className={`${
              date && isFutureDate(date)
                ? "bg-gray-400"
                : "bg-green-500 hover:bg-green-600"
            } text-white font-bold py-2 px-4 rounded-full transition-colors duration-300`}
          >
            Lưu điểm danh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CatechistAttendanceScreen;

import React, { useState, useEffect, useCallback } from "react";
import { Select, Table, Card, Spin, message, Tag } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;

interface AttendanceDetail {
  isAbsent: "ABSENT" | "FUTURE" | "FALSE";
  isAbsentWithPermission: "TRUE" | "FALSE";
  roomNo: string;
  time: string;
  slotOrder: string;
}

interface AttendanceData {
  studentAccount: string;
  studentName: string;
  className: string;
  attendanceDetails: AttendanceDetail[];
}

interface Policy {
  id: number;
  absenceLimit: number;
  numberOfMember: number;
  absenceWithPermissionLimit: number | null;
  status: string;
}

const StudentAttendanceProgressScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    number | null
  >(null);
  const [activePolicy, setActivePolicy] = useState<Policy | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null
  );

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      setAcademicYears(response.data);
    } catch (error) {
      console.log(error);
      message.error("Không thể lấy danh sách niên khóa");
    }
  };

  const fetchActivePolicy = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const studentId = user?.id;
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/policy/student/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "success") {
        const activePolicy = response.data.data.find(
          (policy: Policy) => policy.status === "ACTIVE"
        );
        setActivePolicy(activePolicy);
      }
    } catch (error) {
      console.error("Error fetching policy:", error);
      message.error("Không thể lấy thông tin quy định");
    }
  };

  const fetchAttendanceData = useCallback(async () => {
    if (!selectedAcademicYear ) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const studentId = user?.id;

      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/attendance/info?academicYearId=${selectedAcademicYear}&studentId=${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAttendanceData(response.data.data);
    } catch (error) {
      console.log(error);
      message.error("Không thể lấy thông tin điểm danh");
    } finally {
      setLoading(false);
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    fetchAcademicYears();
    fetchActivePolicy();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchAttendanceData();
    }
  }, [selectedAcademicYear, fetchAttendanceData]);

  const getAttendanceStatus = (detail: AttendanceDetail) => {
    if (detail.isAbsent === "FUTURE") {
      return <Tag color="default">Chưa diễn ra</Tag>;
    } else if (detail.isAbsent === "ABSENT") {
      return detail.isAbsentWithPermission === "TRUE" ? (
        <Tag color="orange">Vắng có phép</Tag>
      ) : (
        <Tag color="red">Vắng không phép</Tag>
      );
    } else {
      return <Tag color="green">Có mặt</Tag>;
    }
  };

  const getAttendanceStats = () => {
    if (!attendanceData?.attendanceDetails || !activePolicy) return null;

    const totalSessions = attendanceData.attendanceDetails.filter(
      (d) => d.isAbsent !== "FUTURE"
    ).length;
    const absentWithPermission = attendanceData.attendanceDetails.filter(
      (d) => d.isAbsent === "ABSENT" && d.isAbsentWithPermission === "TRUE"
    ).length;
    const absentWithoutPermission = attendanceData.attendanceDetails.filter(
      (d) => d.isAbsent === "ABSENT" && d.isAbsentWithPermission === "FALSE"
    ).length;

    const absentPercentage = totalSessions
      ? (
          ((absentWithPermission + absentWithoutPermission) / totalSessions) *
          100
        ).toFixed(1)
      : 0;

    return (
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">
          Thống kê điểm danh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-sm text-gray-500 mb-1">Vắng có phép</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-indigo-600">
                {absentWithPermission}
              </span>
              <span className="text-sm text-gray-400">
                /{activePolicy.absenceWithPermissionLimit} buổi
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-sm text-gray-500 mb-1">Vắng không phép</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-indigo-600">
                {absentWithoutPermission}
              </span>
              <span className="text-sm text-gray-400">
                /{activePolicy.absenceLimit} buổi
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-sm text-gray-500 mb-1">Tổng vắng</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-indigo-600">
                {absentPercentage}%
              </span>
              <span className="text-sm text-gray-400">
                {absentWithPermission + absentWithoutPermission}/{totalSessions}{" "}
                buổi
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const columns = [
    {
      title: "Buổi",
      dataIndex: "slotOrder",
      key: "slotOrder",
      width: "10%",
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      render: (time: string) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Phòng",
      dataIndex: "roomNo",
      key: "roomNo",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (record: AttendanceDetail) => getAttendanceStatus(record),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4"
      >
        Thông Tin Điểm Danh
      </h1>

      <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Niên khóa
            </label>
            <Select
              className="w-full"
              placeholder="Chọn niên khóa"
              onChange={(value) => setSelectedAcademicYear(value)}
              value={selectedAcademicYear}
            >
              {academicYears.map((year) => (
                <Option key={year.id} value={year.id}>
                  {year.year}{" "}
                  {year.timeStatus === "NOW" && (
                    <Tag color="blue" className="ml-2">
                      Hiện tại
                    </Tag>
                  )}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg">
          <Spin size="large" />
        </div>
      ) : (
        <Card className="shadow-lg rounded-xl border border-indigo-100">
          {attendanceData ? (
            <>
              <div className="mb-6">
                <div className="text-lg font-medium mb-2">
                  {attendanceData.className}
                </div>
                <div className="text-sm text-gray-500">
                  Thiếu nhi: {attendanceData.studentName} (
                  {attendanceData.studentAccount})
                </div>
              </div>
              <Table
                dataSource={attendanceData.attendanceDetails}
                columns={columns}
                rowKey="slotOrder"
                pagination={false}
                className="border rounded-lg"
                rowClassName="hover:bg-blue-50 transition-colors"
              />
              {attendanceData && getAttendanceStats()}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">
                Không tìm thấy dữ liệu điểm danh cho bộ lọc đã chọn
              </div>
              <div className="text-gray-500 text-sm mt-2">
                Vui lòng kiểm tra lại các thông tin đã chọn
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentAttendanceProgressScreen;

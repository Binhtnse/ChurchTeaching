import React, { useState, useEffect, useCallback } from "react";
import { Select, Table, Card, Spin, message, Tag } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;

interface Student {
  id: number;
  fullName: string;
  account: string;
}

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

const ParentAttendanceProgressScreen: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
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

  const fetchStudents = useCallback(async () => {
    try {
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const parentId = user?.id;
      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/user/${parentId}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(response.data.data);
    } catch (error) {
      console.log(error);
      message.error("Không thể lấy danh sách học sinh");
    }
  }, []);

  const fetchActivePolicy = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/policy"
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

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=10",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.status === "success") {
        setGrades(response.data.data);
      }
    } catch (error) {
      console.log(error);
      message.error("Không thể lấy danh sách khối");
    }
  };

  const fetchAttendanceData = useCallback(async () => {
    if (!selectedStudent || !selectedAcademicYear || !selectedGrade) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/attendance/info?academicYearId=${selectedAcademicYear}&gradeId=${selectedGrade}&studentId=${selectedStudent}`,
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
  }, [selectedStudent, selectedAcademicYear, selectedGrade]);

  useEffect(() => {
    fetchStudents();
    fetchAcademicYears();
    fetchGrades();
    fetchActivePolicy();
  }, [fetchStudents]);

  useEffect(() => {
    if (selectedStudent && selectedAcademicYear && selectedGrade) {
      fetchAttendanceData();
    }
  }, [
    selectedStudent,
    selectedAcademicYear,
    selectedGrade,
    fetchAttendanceData,
  ]);

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
  
    const totalSessions = attendanceData.attendanceDetails.filter(d => d.isAbsent !== "FUTURE").length;
    const absentWithPermission = attendanceData.attendanceDetails.filter(d => 
      d.isAbsent === "ABSENT" && d.isAbsentWithPermission === "TRUE"
    ).length;
    const absentWithoutPermission = attendanceData.attendanceDetails.filter(d => 
      d.isAbsent === "ABSENT" && d.isAbsentWithPermission === "FALSE"
    ).length;
    
    const absentPercentage = totalSessions ? ((absentWithPermission + absentWithoutPermission) / totalSessions * 100).toFixed(1) : 0;
  
    return (
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">Thống kê điểm danh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-sm text-gray-500 mb-1">Vắng có phép</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-indigo-600">{absentWithPermission}</span>
              <span className="text-sm text-gray-400">
                /{activePolicy.absenceWithPermissionLimit} buổi
              </span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-sm text-gray-500 mb-1">Vắng không phép</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-indigo-600">{absentWithoutPermission}</span>
              <span className="text-sm text-gray-400">
                /{activePolicy.absenceLimit} buổi
              </span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-sm text-gray-500 mb-1">Tổng vắng</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-indigo-600">{absentPercentage}%</span>
              <span className="text-sm text-gray-400">
                {absentWithPermission + absentWithoutPermission}/{totalSessions} buổi
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
      <h1 className="text-2xl font-bold text-blue-600"
      >
        Thông Tin Điểm Danh
      </h1>

      <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Khối</label>
            <Select
              className="w-full"
              placeholder="Chọn khối"
              onChange={(value) => setSelectedGrade(value)}
              value={selectedGrade}
            >
              {grades.map((grade) => (
                <Option key={grade.id} value={grade.id}>
                  {grade.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Thiếu nhi
            </label>
            <Select
              className="w-full"
              placeholder="Chọn thiếu nhi"
              onChange={(value) => setSelectedStudent(value)}
              value={selectedStudent}
            >
              {students.map((student) => (
                <Option key={student.id} value={student.id}>
                  <div className="flex items-center">
                    <span>{student.fullName}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({student.account})
                    </span>
                  </div>
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
                  Học sinh: {attendanceData.studentName} (
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

export default ParentAttendanceProgressScreen;

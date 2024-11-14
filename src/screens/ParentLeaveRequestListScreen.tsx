import React, { useState, useEffect } from "react";
import { Table, Tag, Card, Spin, message, Button, Select } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

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

interface Grade {
  id: number;
  name: string;
}

const ParentLeaveRequestListScreen: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    number | null
  >(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const userString = localStorage.getItem("userLogin");
        const user = userString ? JSON.parse(userString) : null;
        const parentId = user?.id;
        const token = localStorage.getItem("accessToken");

        let url = `https://sep490-backend-production.up.railway.app/api/v1/leave-requests/parent/${parentId}`;
        if (selectedAcademicYear)
          url += `?academicYearId=${selectedAcademicYear}`;
        if (selectedGrade)
          url += `${selectedAcademicYear ? "&" : "?"}gradeId=${selectedGrade}`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === "SUCCESS") {
          setLeaveRequests(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        message.error("Không thể lấy danh sách đơn xin nghỉ");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [selectedAcademicYear, selectedGrade]);

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

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
  }, []);

  const columns = [
    {
      title: "Thiếu nhi",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Buổi học",
      dataIndex: "timeTableName",
      key: "timeTableName",
    },
    {
      title: "Thời gian buổi học",
      dataIndex: "timeTableTime",
      key: "timeTableTime",
      render: (time: string) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thời gian xin nghỉ",
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
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600">
          Danh Sách Đơn Xin Nghỉ
        </h1>
        <Button onClick={() => navigate(-1)} className="hover:bg-gray-100">
          Quay lại
        </Button>
      </div>

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
              allowClear
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
              allowClear
            >
              {grades.map((grade) => (
                <Option key={grade.id} value={grade.id}>
                  {grade.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card className="shadow-lg rounded-xl border border-indigo-100">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={leaveRequests}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            className="border rounded-lg"
            rowClassName="hover:bg-blue-50 transition-colors"
          />
        )}
      </Card>
    </div>
  );
};

export default ParentLeaveRequestListScreen;

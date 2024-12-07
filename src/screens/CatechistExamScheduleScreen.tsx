import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Spin, Table, Tag, message, Card, Select } from "antd";
import type { ColumnsType } from "antd/es/table";

interface ExamSchedule {
  roomNo: string;
  dayOfWeek: string;
  date: string;
  time: string;
  examName: string;
  className: string;
}

interface WeekSchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  classes: Array<{
    className: string;
    roomNo: string;
    slots: Array<{
      dayOfWeek: string;
      time: string;
      exams: string;
    }>;
  }>;
}

interface ClassData {
  id: number;
  name: string;
  numberOfCatechist: number | null;
  gradeName: string;
  academicYear: string;
  status: string;
}

const CatechistExamScheduleScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [academicYears, setAcademicYears] = useState<
    Array<{
      id: number;
      year: string;
      timeStatus: string;
    }>
  >([]);
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);

  const columns: ColumnsType<ExamSchedule> = [
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
      render: (text) => (
        <Tag color="purple" className="px-3 py-1">
          {text}
        </Tag>
      ),
    },
    {
      title: "Ngày",
      dataIndex: "dayOfWeek",
      key: "dayOfWeek",
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{text}</span>
          <span className="text-gray-500 text-sm">{record.date}</span>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      render: (text) => (
        <span className="font-medium text-indigo-600">{text}</span>
      ),
    },
    {
      title: "Phòng",
      dataIndex: "roomNo",
      key: "roomNo",
      render: (text) => (
        <Tag color="green" className="px-4 py-1 text-base">
          {text}
        </Tag>
      ),
    },
    {
      title: "Bài kiểm tra",
      dataIndex: "examName",
      key: "examName",
      render: (text) => (
        <Tag color="blue" className="px-4 py-1.5 text-base rounded-lg">
          {text}
        </Tag>
      ),
    },
  ];

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      setAcademicYears(response.data);
      const currentYear = response.data.find(
        (year: { timeStatus: string }) => year.timeStatus === "NOW"
      );
      if (currentYear) {
        setSelectedYear(currentYear.year);
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
      message.error("Failed to fetch academic years");
    }
  };

  const fetchClasses = async () => {
    try {
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const userId = user ? user.id : null;

      if (!userId || !selectedYear) return;

      const yearObj = academicYears.find((year) => year.year === selectedYear);
      if (!yearObj) return;

      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/catechist/${userId}?page=1&size=100&academicYearId=${yearObj.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.data.data) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      message.error("Không thể tải danh sách lớp học");
    }
  };

  const fetchSchedule = useCallback(async () => {
    try {
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.id;
      const accessToken = localStorage.getItem("accessToken");

      if (!userId) {
        console.error("User ID not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/schedule/catechist/${userId}?academicYear=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}` // Add this header
          }
        }
      );

      if (!response.data.data) {
        setExamSchedules([]);
        return;
      }

      const examData: ExamSchedule[] = [];
      response.data.data.schedule.forEach((week: WeekSchedule) => {
        week.classes
          .filter(
            (classItem) =>
              !selectedClass || classItem.className === selectedClass
          ) // Filter classes first
          .forEach((classItem) => {
            classItem.slots.forEach((slot) => {
              if (slot.exams) {
                const date = new Date(week.startDate);
                const dayIndex = [
                  "Thứ Hai",
                  "Thứ Ba",
                  "Thứ Tư",
                  "Thứ Năm",
                  "Thứ Sáu",
                  "Thứ Bảy",
                  "Chủ Nhật",
                ].indexOf(slot.dayOfWeek);
                date.setDate(date.getDate() + dayIndex);

                examData.push({
                  className: classItem.className,
                  roomNo: classItem.roomNo,
                  dayOfWeek: slot.dayOfWeek,
                  date: date.toLocaleDateString("vi-VN"),
                  time: slot.time,
                  examName: slot.exams,
                });
              }
            });
          });
      });

      setExamSchedules(examData);
    } catch (error) {
      console.error(error);
      message.error("Lấy danh sách lịch kiểm tra thất bại");
      setExamSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedClass]);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  useEffect(() => {
    if (selectedYear) {
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg max-w-7xl mx-auto my-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
          Lịch Kiểm Tra
        </h1>
      </div>

      <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Năm học</label>
            <p className="text-gray-600">{selectedYear}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Lớp</label>
            <Select
              className="w-full"
              placeholder="Chọn lớp"
              onChange={(value) => setSelectedClass(value)}
              value={selectedClass}
              allowClear
            >
              {classes.map((classItem) => (
                <Select.Option key={classItem.id} value={classItem.name}>
                  {classItem.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {selectedClass ? (
        <div className="bg-white rounded-lg overflow-hidden">
          <Table
            columns={columns}
            dataSource={
              selectedClass
                ? examSchedules.filter(
                    (exam) => exam.className === selectedClass
                  )
                : examSchedules
            }
            rowKey={(record) =>
              `${record.date}-${record.time}-${record.examName}-${record.className}`
            }
            className="shadow-sm"
            pagination={false}
            rowClassName="hover:bg-gray-50 transition-colors"
            style={{ borderRadius: "8px" }}
          />
          {examSchedules.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                Không có lịch kiểm tra nào trong thời gian này
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            Vui lòng chọn lớp để xem lịch kiểm tra
          </p>
        </div>
      )}
    </div>
  );
};

export default CatechistExamScheduleScreen;

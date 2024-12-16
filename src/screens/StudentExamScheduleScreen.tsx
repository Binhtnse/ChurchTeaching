import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Spin, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";


interface ExamSchedule {
  roomNo: string;
  dayOfWeek: string;
  date: string;
  time: string;
  examName: string;
}

interface WeekSchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  classes: Array<{
    roomNo: string;
    slots: Array<{
      dayOfWeek: string;
      time: string;
      exams: string;
    }>;
  }>;
}

const dayOfWeekMapping: { [key: string]: string } = {
  "SUNDAY": "Chủ Nhật",
  "MONDAY": "Thứ Hai", 
  "TUESDAY": "Thứ Ba",
  "WEDNESDAY": "Thứ Tư",
  "THURSDAY": "Thứ Năm",
  "FRIDAY": "Thứ Sáu",
  "SATURDAY": "Thứ Bảy"
};

const StudentExamScheduleScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [academicYears, setAcademicYears] = useState<Array<{
    id: number;
    year: string;
    timeStatus: string;
  }>>([]);
  console.log(academicYears)
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);

  const normalizeVietnameseDay = (day: string): string => {
    return dayOfWeekMapping[day] || day;
  };

  const columns: ColumnsType<ExamSchedule> = [
    {
      title: "Ngày",
      dataIndex: "dayOfWeek",
      key: "dayOfWeek",
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{normalizeVietnameseDay(text)}</span>
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

  const fetchSchedule = useCallback(async () => {
    try {
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.id;
      const token = localStorage.getItem("accessToken");
      
      if (!userId) {
        console.error("User ID not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/schedule/student/${userId}?academicYear=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.data) {
        setExamSchedules([]);
        return;
      }

      const examData: ExamSchedule[] = [];
      response.data.data.schedule.forEach((week: WeekSchedule) => {
        week.classes.forEach((classItem) => {
          classItem.slots.forEach((slot) => {
            if (slot.exams) {
              const date = new Date(week.startDate);
              const dayIndex = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"].indexOf(slot.dayOfWeek);
              date.setDate(date.getDate() + dayIndex);

              examData.push({
                roomNo: classItem.roomNo,
                dayOfWeek: dayOfWeekMapping[slot.dayOfWeek] || slot.dayOfWeek,
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
      message.error("Failed to fetch exam schedule");
      setExamSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchSchedule();
    }
  }, [selectedYear, fetchSchedule]);

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
        <p className="text-gray-600 mt-2">
          Năm học: {selectedYear}
        </p>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        <Table
          columns={columns}
          dataSource={examSchedules}
          rowKey={(record) => `${record.date}-${record.time}-${record.examName}`}
          className="shadow-sm"
          pagination={false}
          rowClassName="hover:bg-gray-50 transition-colors"
          style={{ borderRadius: '8px' }}
        />
      </div>

      {examSchedules.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            Không có lịch kiểm tra nào trong thời gian này
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentExamScheduleScreen;

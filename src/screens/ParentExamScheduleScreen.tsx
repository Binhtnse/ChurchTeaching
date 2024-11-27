import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Spin, Table, Tag, message, Select } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

interface Student {
  id: number;
  fullName: string;
  account: string;
}

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

const ParentExamScheduleScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [academicYears, setAcademicYears] = useState<Array<{
    id: number;
    year: string;
    timeStatus: string;
  }>>([]);
  console.log(academicYears)
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);

  const columns: ColumnsType<ExamSchedule> = [
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

  const fetchStudents = useCallback(async () => {
    try {
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const parentId = user?.id;
      const token = localStorage.getItem("accessToken");
  
      if (!parentId) {
        message.error("Không tìm thấy thông tin phụ huynh");
        return;
      }
  
      // Find the year ID based on the selected year
      const selectedYearObj = academicYears.find(year => year.year === selectedYear);
      const yearId = selectedYearObj?.id;
  
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/user/${parentId}/students?yearId=${yearId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.data.data || response.data.data.length === 0) {
        message.info("Không tìm thấy thiếu nhi nào được liên kết với tài khoản");
        setStudents([]);
        return;
      }
  
      setStudents(response.data.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Không thể lấy danh sách thiếu nhi");
      setStudents([]);
    }
  }, [selectedYear, academicYears]);
  

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
    if (!selectedStudent || !selectedYear) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/schedule/student/${selectedStudent}?academicYear=${selectedYear}`
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
      message.error("Failed to fetch exam schedule");
      setExamSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudent, selectedYear]);

  useEffect(() => {
    fetchStudents();
    fetchAcademicYears();
  }, [fetchStudents]);

  useEffect(() => {
    if (selectedStudent && selectedYear) {
      fetchSchedule();
    }
  }, [selectedStudent, selectedYear, fetchSchedule]);

  const handleStudentChange = (studentId: number) => {
    setSelectedStudent(studentId);
    setLoading(true);
  };

  if (loading && selectedStudent) {
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
          Lịch Kiểm Tra Của Con
        </h1>
        
        <div className="mt-4">
          <Select
            style={{ width: 300 }}
            placeholder="Chọn thiếu nhi"
            onChange={handleStudentChange}
            value={selectedStudent}
            className="shadow-sm"
            allowClear
          >
            {students.map((student) => (
              <Option key={student.id} value={student.id}>
                {student.fullName} ({student.account})
              </Option>
            ))}
          </Select>
        </div>

        {selectedStudent && (
          <p className="text-gray-600 mt-2">
            Năm học: {selectedYear}
          </p>
        )}
      </div>

      {!selectedStudent ? (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-semibold">Vui lòng chọn thiếu nhi</p>
          <p className="text-sm">Vui lòng chọn thiếu nhi để xem lịch kiểm tra</p>
        </div>
      ) : (
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

          {examSchedules.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                Không có lịch kiểm tra nào trong thời gian này
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentExamScheduleScreen;

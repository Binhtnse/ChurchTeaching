import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, Typography, Spin, Select, message, Tag } from "antd";
import styled from "styled-components";

const { Title, Text } = Typography;
const { Option } = Select;

interface Material {
  name: string;
  link: string;
}

interface Slot {
  timeTableId: number;
  dayOfWeek: string;
  time: string;
  slotOrder: number;
  slotType: string;
  description: string;
  name: string;
  session: {
    name: string;
    description: string;
  };
  materials: Material[];
  attendance: Attendance;
  exams?: string;
  noteOfSlot: string | null;
}

interface Attendance {
  isAbsent: string;
  isAbsentWithPermission: string;
}

interface Class {
  className: string;
  grade: string;
  roomNo: string;
  status: string;
  teacherAccount: string;
  slots: Slot[];
}

interface WeekSchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  classes: Class[];
}

interface ScheduleData {
  studentId: number;
  academicYear: string;
  schedule: WeekSchedule[];
}

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: auto repeat(6, 1fr) 2fr;
  gap: 2px;
  background-color: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
`;

const CalendarCell = styled.div`
  background-color: white;
  padding: 12px;
  min-height: 120px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const SundayCell = styled(CalendarCell)`
  grid-column: 8;
  background-color: #f6f8fa;
`;

const TimeCell = styled(CalendarCell)`
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e6f7ff;
`;

const DayCell = styled(CalendarCell)`
  font-weight: bold;
  text-align: center;
  background-color: #1890ff;
  color: white;
`;

const StudentScheduleScreen: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const fetchSchedule = useCallback(async () => {
    setScheduleLoading(true);
    try {
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.id;
      if (!userId) {
        console.error("User ID not found");
        setLoading(false);
        return;
      }
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/schedule/student/${userId}?academicYear=${selectedYear}`
      );
      if (!response.data.data || response.data.data.length === 0) {
        setScheduleData(null);
        setSelectedWeek(1);
        return;
      }
      const adjustedSchedule = {
        ...response.data.data,
        schedule: response.data.data.schedule.map(adjustWeekDates),
      };

      setScheduleData(adjustedSchedule);
      const currentDate = new Date();
      const currentWeek = response.data.data.schedule.find(
        (week: WeekSchedule) => {
          const startDate = new Date(week.startDate);
          const endDate = new Date(week.endDate);
          return currentDate >= startDate && currentDate <= endDate;
        }
      );
      setSelectedWeek(
        currentWeek
          ? currentWeek.weekNumber
          : response.data.data.schedule[0].weekNumber
      );
    } catch (error) {
      console.log(error);
      setScheduleData(null);
      setSelectedWeek(1);
    } finally {
      setScheduleLoading(false);
    }
  }, [selectedYear]);

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

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchSchedule();
    }
  }, [selectedYear, fetchSchedule]);

  const createTimetable = (
    slots: Slot[]
  ): { [key: string]: { [key: string]: Slot | null } } => {
    const apiSunday = slots[0].dayOfWeek;
    const days = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      apiSunday,
    ];
    const times = [...new Set(slots.map((slot) => slot.time))].sort();

    const timetable = days.reduce((acc, day) => {
      acc[day] = times.reduce((timeAcc, time) => {
        timeAcc[time] = null;
        return timeAcc;
      }, {} as { [key: string]: Slot | null });
      return acc;
    }, {} as { [key: string]: { [key: string]: Slot | null } });

    slots.forEach((slot) => {
      if (timetable[slot.dayOfWeek] && times.includes(slot.time)) {
        timetable[slot.dayOfWeek][slot.time] = slot;
      }
    });

    return timetable;
  };

  const adjustWeekDates = (weekData: WeekSchedule) => {
    const endDate = new Date(weekData.endDate);
    endDate.setDate(endDate.getDate() - 1);
    return {
      ...weekData,
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const currentWeek = scheduleData?.schedule.find(
    (week) => week.weekNumber === selectedWeek
  );

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const renderCalendar = (
    timetable: { [key: string]: { [key: string]: Slot | null } },
    classItem: Class
  ) => {
    const days = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      classItem.slots[0].dayOfWeek,
    ];
    const times = [...new Set(classItem.slots.map((slot) => slot.time))].sort();

    days.forEach((day) => {
      if (!timetable[day]) {
        timetable[day] = {};
      }
      times.forEach((time) => {
        if (timetable[day] && !timetable[day][time]) {
          timetable[day][time] = null;
        }
      });
    });

    const weekStart = new Date(currentWeek!.startDate);
    const dates = days.map((_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return formatDate(date);
    });

    return (
      <CalendarGrid>
        <CalendarCell />
        {days.map((day, index) => (
          <DayCell key={day}>
            <div>{day}</div>
            <div className="text-sm mt-1">{dates[index]}</div>
          </DayCell>
        ))}
        {times.map((time) => (
          <React.Fragment key={time}>
            <TimeCell>{time}</TimeCell>
            {days.map((day, index) => {
              const CellComponent = index === 6 ? SundayCell : CalendarCell;
              const slot = timetable[day] && timetable[day][time];
              return (
                <CellComponent key={`${day}-${time}`}>
                  {slot && (
                    <div className="flex flex-col h-full">
                      <Text className="text-gray-500 mb-1">
                        Phòng: {classItem.roomNo}
                      </Text>
                      <strong className="text-blue-600 mb-1">
                        {slot.name}
                      </strong>
                      <div className="mt-auto">
                        {slot.session && (
                          <Text className="text-green-600">
                            Chương: {slot.session.name}
                          </Text>
                        )}
                        {slot.noteOfSlot && (
                          <Text className="text-orange-600 block mt-1">
                            Ghi chú: {slot.noteOfSlot}
                          </Text>
                        )}
                        {slot.exams && (
                          <Text className="text-red-600 block mt-1">
                            Kiểm tra: {slot.exams}
                          </Text>
                        )}
                        {slot.materials && slot.materials.length > 0 && (
                          <div className="mt-2">
                            <Text className="text-purple-600 font-medium">
                              Tài liệu:
                            </Text>
                            <ul className="list-disc pl-4">
                              {slot.materials.map((material, index) => (
                                <li key={index}>
                                  <a
                                    href={material.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 underline"
                                  >
                                    {material.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {slot.attendance &&
                          slot.attendance.isAbsent !== "FUTURE" && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <Text
                                className={`${
                                  slot.attendance.isAbsent === "TRUE"
                                    ? slot.attendance.isAbsentWithPermission ===
                                      "TRUE"
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                    : "text-green-600"
                                } font-medium`}
                              >
                                Trạng thái điểm danh:
                                {slot.attendance.isAbsent === "TRUE"
                                  ? slot.attendance.isAbsentWithPermission ===
                                    "TRUE"
                                    ? " Vắng có phép"
                                    : " Vắng không phép"
                                  : " Có mặt"}
                              </Text>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                  {index === 6 && (
                    <div className="mt-2 bg-gray-100 p-2 rounded">
                      <Text
                        strong
                        className="text-indigo-600"
                      >{`${classItem.className} - ${classItem.grade}`}</Text>
                    </div>
                  )}
                </CellComponent>
              );
            })}
          </React.Fragment>
        ))}
      </CalendarGrid>
    );
  };

  if (loading) {
    return (
      <Spin
        size="large"
        className="flex justify-center items-center h-screen"
      />
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Lịch Học Thiếu Nhi
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
              onChange={(value: string) => setSelectedYear(value)}
              value={selectedYear}
            >
              {academicYears.map((year) => (
                <Option key={year.id} value={year.year}>
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
            <label className="text-sm font-medium text-gray-600">Tuần</label>
            <Select
              className="w-full"
              value={selectedWeek}
              onChange={(value) => setSelectedWeek(value)}
              placeholder="Chọn tuần"
            >
              {scheduleData?.schedule.map((week) => (
                <Option key={week.weekNumber} value={week.weekNumber}>
                  Tuần {week.weekNumber}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <Text strong className="text-lg mr-6">
          Niên Khóa: {selectedYear}
        </Text>
        <Text strong className="text-lg">
          Tuần: {selectedWeek}
        </Text>
      </div>

      {scheduleLoading ? (
        <div className="flex justify-center items-center mt-8">
          <Spin size="large" tip="Đang tải lịch học..." />
        </div>
      ) : (
        currentWeek && (
          <div className="mt-4">
            <Text>
              Từ {currentWeek.startDate} đến {currentWeek.endDate}
            </Text>
            {currentWeek.classes.map((classItem, index) => {
              const timetable = createTimetable(classItem.slots);
              return (
                <Card key={index} className="mb-4 mt-4">
                  <Title
                    level={4}
                  >{`${classItem.className} - ${classItem.grade}`}</Title>
                  <Text>Giáo lý viên: {classItem.teacherAccount}</Text>
                  {renderCalendar(timetable, classItem)}
                </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default StudentScheduleScreen;

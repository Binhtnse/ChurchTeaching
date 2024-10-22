import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, Typography, Spin, Select, message } from "antd";
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
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const fetchSchedule = useCallback(async () => {
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
        `https://sep490-backend-production.up.railway.app/api/v1/schedule/student/${userId}`
      );
      setScheduleData(response.data.data);
      setSelectedYear(response.data.data.academicYear);
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      message.error("Failed to fetch schedule");
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const createTimetable = (slots: Slot[]): { [key: string]: { [key: string]: Slot | null } } => {
    const timetable: { [key: string]: { [key: string]: Slot | null } } = {};
    slots.forEach((slot) => {
      if (!timetable[slot.dayOfWeek]) {
        timetable[slot.dayOfWeek] = {};
      }
      timetable[slot.dayOfWeek][slot.time] = slot;
    });
    return timetable;
  };

  const currentWeek = scheduleData?.schedule.find(
    (week) => week.weekNumber === selectedWeek
  );

  const renderCalendar = (timetable: { [key: string]: { [key: string]: Slot | null } }, classItem: Class) => {
    const days = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      "Chủ Nhật",
    ];
    const times = Array.from(
      new Set(Object.values(timetable).flatMap((day) => Object.keys(day)))
    ).sort();

    return (
      <CalendarGrid>
        <CalendarCell />
        {days.map((day) => (
          <DayCell key={day}>{day}</DayCell>
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
                      <Text className="text-gray-500 mb-1">Phòng: {classItem.roomNo}</Text>
                      <strong className="text-blue-600 mb-1">{slot.name}</strong>
                      <div className="mt-auto">
                        <Text className="text-green-600">Chương: {slot.session.name}</Text>
                      </div>
                    </div>
                  )}
                  {index === 6 && (
                    <div className="mt-2 bg-gray-100 p-2 rounded">
                      <Text strong className="text-indigo-600">{`${classItem.className} - ${classItem.grade}`}</Text>
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
    <div className="p-8 bg-gray-100 min-h-screen">
      <Title level={2} className="mb-6">Lịch Học</Title>

      <div className="flex space-x-6 mb-6">
        <Select
          style={{ width: 240 }}
          value={selectedYear}
          onChange={(value) => setSelectedYear(value)}
          className="shadow-sm"
        >
          <Option value={scheduleData?.academicYear}>
            {scheduleData?.academicYear}
          </Option>
        </Select>

        <Select
          style={{ width: 240 }}
          value={selectedWeek}
          onChange={(value) => setSelectedWeek(value)}
          placeholder="Chọn tuần"
          className="shadow-sm"
        >
          {scheduleData?.schedule.map((week) => (
            <Option key={week.weekNumber} value={week.weekNumber}>
              Tuần {week.weekNumber}
            </Option>
          ))}
        </Select>
      </div>

      <div className="mb-6">
        <Text strong className="text-lg mr-6">Niên Khóa: {selectedYear}</Text>
        <Text strong className="text-lg">Tuần: {selectedWeek}</Text>
      </div>

      {currentWeek && (
        <div className="mt-4">
          <Text>
            Từ {currentWeek.startDate} đến {currentWeek.endDate}
          </Text>
          {currentWeek.classes.map((classItem, index) => {
            const timetable = createTimetable(classItem.slots);
            return (
              <Card key={index} className="mb-4 mt-4">
                <Title level={4}>{`${classItem.className} - ${classItem.grade}`}</Title>
                <Text>Giáo lý viên: {classItem.teacherAccount}</Text>
                {renderCalendar(timetable, classItem)}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentScheduleScreen;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Typography, Spin, Select } from "antd";
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
  gap: 1px;
  background-color: #f0f0f0;
`;

const CalendarCell = styled.div`
  background-color: white;
  padding: 8px;
  min-height: 100px;
  border: 1px solid #f0f0f0;
`;

const TimeCell = styled(CalendarCell)`
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SundayCell = styled(CalendarCell)`
  grid-column: 8;
  background-color: #f9f9f9;
`;

const DayCell = styled(CalendarCell)`
  font-weight: bold;
  text-align: center;
`;

const StudentScheduleScreen: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(
          "https://sep490-backend-production.up.railway.app/api/v1/schedule/student/76"
        );
        setScheduleData(response.data.data);
        setSelectedYear(response.data.data.academicYear);
        const currentDate = new Date();
        const currentWeek = response.data.data.schedule.find((week: WeekSchedule) => {
          const startDate = new Date(week.startDate);
          const endDate = new Date(week.endDate);
          return currentDate >= startDate && currentDate <= endDate;
        });
        setSelectedWeek(currentWeek ? currentWeek.weekNumber : response.data.data.schedule[0].weekNumber);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setLoading(false);
      }
    };
  
    fetchSchedule();
  }, []);  

  const currentWeek = scheduleData?.schedule.find(
    (week) => week.weekNumber === selectedWeek
  );

  const renderCalendar = (classItem: Class) => {
    const days = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      "Chủ Nhật",
    ];
    const times = Array.from(new Set(classItem.slots.map(slot => slot.time))).sort();
  
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
              const slot = classItem.slots.find(
                (s) => s.dayOfWeek === day && s.time === time
              );
              return (
                <CellComponent key={`${day}-${time}`}>
                  {slot && (
                    <div className="flex flex-col">
                      <Text>Phòng: {classItem.roomNo}</Text>
                      <strong>{slot.name}</strong>
                      <Text>{slot.description}</Text>
                    </div>
                  )}
                  {index === 6 && (
                    <div className="mt-2">
                      <Text strong>{`${classItem.className} - ${classItem.grade}`}</Text>
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
    <div className="p-6">
      <Title level={2}>Lịch Học</Title>

      <div className="flex space-x-4 mb-4">
        <Select
          style={{ width: 200 }}
          value={selectedYear}
          onChange={(value) => setSelectedYear(value)}
        >
          <Option value={scheduleData?.academicYear}>
            {scheduleData?.academicYear}
          </Option>
        </Select>

        <Select
          style={{ width: 200 }}
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

      <Text strong>Niên Khóa: {selectedYear}</Text>
      <Text strong className="ml-4">
        Tuần: {selectedWeek}
      </Text>

      {currentWeek && (
        <div className="mt-4">
          <Text>
            Từ {currentWeek.startDate} đến {currentWeek.endDate}
          </Text>
          {currentWeek.classes.map((classItem, index) => (
            <Card key={index} className="mb-4 mt-4">
              <Title level={4}>{`${classItem.className} - ${classItem.grade}`}</Title>
              <Text>Giáo lý viên: {classItem.teacherAccount}</Text>
              {renderCalendar(classItem)}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentScheduleScreen;

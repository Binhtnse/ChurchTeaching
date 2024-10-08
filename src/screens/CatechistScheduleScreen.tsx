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

interface TimetableSlot {
  [key: string]: Slot | null;
}

interface Timetable {
  [key: string]: TimetableSlot;
}

interface Slot {
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
  slots: Slot[];
}

interface WeekSchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  classes: Class[];
}

interface ScheduleData {
  teacherId: number;
  academicYear: string;
  schedule: WeekSchedule[];
}

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: auto repeat(7, 1fr);
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

const DayCell = styled(CalendarCell)`
  font-weight: bold;
  text-align: center;
`;

const CatechistScheduleScreen: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(
          "https://sep490-backend-production.up.railway.app/api/v1/schedule/catechist/8"
        );
        setScheduleData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const createTimetable = (slots: Slot[]): Timetable => {
    const timetable: Timetable = {};
    slots.forEach((slot) => {
      if (!timetable[slot.dayOfWeek]) {
        timetable[slot.dayOfWeek] = {};
      }
      timetable[slot.dayOfWeek][slot.time] = slot;
    });
    return timetable;
  };

  const currentWeek = scheduleData?.schedule.find(week => week.weekNumber === selectedWeek);

  const renderCalendar = (timetable: Timetable) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
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
            {days.map((day) => (
              <CalendarCell key={`${day}-${time}`}>
                {timetable[day] && timetable[day][time] && (
                  <div>
                    <strong>{timetable[day][time]?.name}</strong>
                    <div>{timetable[day][time]?.description}</div>
                  </div>
                )}
              </CalendarCell>
            ))}
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
      <Title level={2}>Lịch Giảng Dạy</Title>

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
          placeholder="Select week"
        >
          {scheduleData?.schedule.map((week) => (
            <Option key={week.weekNumber} value={week.weekNumber}>
              Tuần {week.weekNumber}
            </Option>
          ))}
        </Select>
      </div>

      <Text strong>Niên Khóa: {selectedYear}</Text>
      <Text strong className="ml-4">Tuần: {selectedWeek}</Text>

      {currentWeek && (
        <div className="mt-4">
          <Text>Từ {currentWeek.startDate} đến {currentWeek.endDate}</Text>
          {currentWeek.classes.map((classItem, index) => {
            const timetable = createTimetable(classItem.slots);
            return (
              <Card
                key={index}
                title={`${classItem.className} - ${classItem.grade}`}
                className="mb-4 mt-4"
              >
                <Text>Phòng: {classItem.roomNo}</Text>
                {renderCalendar(timetable)}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CatechistScheduleScreen;

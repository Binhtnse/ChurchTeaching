import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Typography, Spin, Select, message, Tag, Button } from "antd";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

interface ClassData {
  id: number;
  name: string;
  numberOfCatechist: number | null;
  gradeName: string;
  academicYear: string;
  status: string;
}

interface Material {
  name: string;
  link: string;
}

interface TimetableSlot {
  [key: string]: ExtendedSlot[] | null;
}

interface Timetable {
  [key: string]: TimetableSlot;
}

interface Slot {
  timeTableId: string;
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
  exams?: string;
  noteOfSlot: string | null;
}

interface Class {
  className: string;
  grade: string;
  roomNo: string;
  status: string;
  slots: Slot[];
}

interface ExtendedSlot extends Slot {
  className: string;
  grade: string;
  roomNo: string;
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

const CatechistScheduleScreen: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const savedWeek = localStorage.getItem("selectedWeek");
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(
    savedWeek ? parseInt(savedWeek) : 1
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
    const fetchSchedule = async () => {
      setLoading(true);
      setScheduleLoading(true);
      try {
        const userString = localStorage.getItem("userLogin");
        const user = userString ? JSON.parse(userString) : null;
        const userId = user?.id;
        if (!userId) {
          console.error("User ID not found");
          setScheduleData(null);
          setLoading(false);
          return;
        }
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/schedule/catechist/${userId}?academicYear=${selectedYear}`
        );
        if (!response.data.data || response.data.data.length === 0) {
          setScheduleData(null);
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

        // Get saved week from localStorage
        const savedWeek = localStorage.getItem("selectedWeek");

        // Priority: 1. Saved week 2. Current week 3. First week
        const weekToSelect = savedWeek
          ? parseInt(savedWeek)
          : currentWeek
          ? currentWeek.weekNumber
          : response.data.data.schedule[0].weekNumber;

        setSelectedWeek(weekToSelect);
        localStorage.setItem("selectedWeek", weekToSelect.toString());
      } catch (error) {
        console.log(error);
        setScheduleData(null);
      } finally {
        setLoading(false);
        setScheduleLoading(false);
      }
    };

    if (selectedYear) {
      fetchSchedule();
    } else {
      setLoading(false); // Add this line to handle initial state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } else if (response.data.length > 0) {
        setSelectedYear(response.data[0].year);
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
      message.error("Failed to fetch academic years");
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const adjustWeekDates = (weekData: WeekSchedule) => {
    const endDate = new Date(weekData.endDate);
    endDate.setDate(endDate.getDate() - 1);
    return {
      ...weekData,
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const createCombinedTimetable = (classes: Class[]): Timetable => {
    const timetable: Timetable = {};
    classes.forEach((classItem) => {
      classItem.slots.forEach((slot) => {
        console.log(
          "API dayOfWeek unicode:",
          [...slot.dayOfWeek].map((c) => c.charCodeAt(0))
        );
        const normalizedDay = normalizeVietnameseDay(slot.dayOfWeek);
        console.log(
          "Days array unicode:",
          [...normalizedDay[6]].map((c) => c.charCodeAt(0))
        );
        if (!timetable[normalizedDay]) {
          timetable[normalizedDay] = {};
        }
        if (!timetable[normalizedDay][slot.time]) {
          timetable[normalizedDay][slot.time] = [];
        }
        (timetable[normalizedDay][slot.time] as ExtendedSlot[]).push({
          ...slot,
          dayOfWeek: normalizedDay,
          className: classItem.className,
          grade: classItem.grade,
          roomNo: classItem.roomNo,
        });
      });
    });
    return timetable;
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

  const currentWeek = scheduleData?.schedule.find(
    (week) => week.weekNumber === selectedWeek
  );

  const handleMaterialClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // This prevents the click from bubbling up to the cell
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const normalizeVietnameseDay = (day: string): string => {
    // Map API's unicode values to our unicode values
    const mappings: { [key: string]: string } = {
      "Chủ nhật": "Chủ Nhật",
      "Thứ Hai": "Thứ Hai",
      "Thứ Ba": "Thứ Ba",
      "Thứ Tư": "Thứ Tư",
      "Thứ Năm": "Thứ Năm",
      "Thứ Sáu": "Thứ Sáu",
      "Thứ Bảy": "Thứ Bảy",
    };
    return mappings[day] || day;
  };

  const renderCalendar = (timetable: Timetable) => {
    const days = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      String.fromCharCode(84, 104, 432, 769, 32, 66, 97, 777, 121),
      String.fromCharCode(67, 104, 117, 777, 32, 110, 104, 226, 803, 116),
    ];
    const times = Array.from(
      new Set(Object.values(timetable).flatMap((day) => Object.keys(day)))
    ).sort();

    const weekStart = new Date(currentWeek!.startDate);
    const dates = days.map((_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return formatDate(date);
    });

    return (
      <div>
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
              {days.map((day) => {
                const CellComponent = CalendarCell;
                const slot = timetable[day] && timetable[day][time];
                return (
                  <CellComponent key={`${day}-${time}`}>
                    {slot &&
                      slot.map((classSlot, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col h-full mb-4 p-2 border-b last:border-b-0 hover:bg-gray-50 rounded"
                        >
                          <div
                            className={`bg-blue-50 p-2 rounded mb-2 ${
                              idx > 0 ? "mt-2 border-t" : ""
                            }`}
                          >
                            <Text strong className="text-indigo-600">
                              {classSlot.className} - {classSlot.grade}
                            </Text>
                            <Text className="text-gray-500 block">
                              Phòng: {classSlot.roomNo}
                            </Text>
                          </div>

                          <strong className="text-blue-600 mb-1">
                            {classSlot.name}
                          </strong>

                          <div className="mt-auto">
                            {classSlot.session && (
                              <Text className="text-green-600">
                                Chương: {classSlot.session.name}
                              </Text>
                            )}

                            {classSlot.noteOfSlot && (
                              <Text className="text-orange-600 block mt-1">
                                Ghi chú: {classSlot.noteOfSlot}
                              </Text>
                            )}

                            {classSlot.exams && (
                              <Text className="text-red-600 block mt-1">
                                Kiểm tra: {classSlot.exams}
                              </Text>
                            )}

                            {classSlot.materials &&
                              classSlot.materials.length > 0 && (
                                <div className="mt-2">
                                  <Text className="text-purple-600 font-medium">
                                    Tài liệu:
                                  </Text>
                                  <ul className="list-disc pl-4">
                                    {classSlot.materials.map(
                                      (material, index) => (
                                        <li key={index}>
                                          <a
                                            href={material.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700 underline"
                                            onClick={handleMaterialClick}
                                          >
                                            {material.name}
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            <div className="mt-2">
                              <Button
                                type="primary"
                                size="middle"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  const weekStart = new Date(
                                    currentWeek!.startDate
                                  );
                                  weekStart.setHours(0, 0, 0, 0); // Reset time part
                                  const dayIndex = [
                                    "Thứ Hai",
                                    "Thứ Ba",
                                    "Thứ Tư",
                                    "Thứ Năm",
                                    "Thứ Sáu",
                                    "Thứ Bảy",
                                    "Chủ nhật",
                                  ].indexOf(classSlot.dayOfWeek);
                                  const slotDate = new Date(weekStart);
                                  slotDate.setDate(
                                    weekStart.getDate() + dayIndex
                                  );
                                  const formattedDate = slotDate
                                    .toISOString()
                                    .split("T")[0];
                                  const matchingClass = classes.find(
                                    (c) => c.name === classSlot.className
                                  );
                                  if (matchingClass) {
                                    navigate(
                                      `/schedule/attendance/${classSlot.timeTableId}?dayOfWeek=${classSlot.dayOfWeek}&weekNumber=${selectedWeek}&time=${classSlot.time}&date=${formattedDate}&classId=${matchingClass.id}`
                                    );
                                  }
                                }}
                              >
                                Điểm danh
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </CellComponent>
                );
              })}
            </React.Fragment>
          ))}
        </CalendarGrid>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Lịch Giảng Dạy
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
              onChange={(value) => setSelectedYear(value)}
              value={selectedYear}
              allowClear
            >
              {academicYears.map((year) => (
                <Select.Option key={year.id} value={year.year}>
                  {year.year}{" "}
                  {year.timeStatus === "NOW" && (
                    <Tag color="blue" className="ml-2">
                      Hiện tại
                    </Tag>
                  )}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Tuần</label>
            <Select
              className="w-full"
              value={selectedWeek}
              onChange={(value) => {
                setSelectedWeek(value);
                localStorage.setItem("selectedWeek", value.toString());
              }}
              placeholder="Chọn tuần"
            >
              {scheduleData?.schedule.map((week) => (
                <Select.Option key={week.weekNumber} value={week.weekNumber}>
                  Tuần {week.weekNumber}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>
      {selectedYear && !scheduleData?.schedule?.length && !loading && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Title level={4} className="text-gray-600">
            Không tìm thấy lịch học
          </Title>
          <Text className="text-gray-500">
            Vui lòng chọn niên khóa khác để xem lịch học
          </Text>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <>
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
                {currentWeek && (
                  <div className="mt-4">
                    <Text>
                      Từ {currentWeek.startDate} đến {currentWeek.endDate}
                    </Text>
                    <Card className="mb-4 mt-4">
                      {renderCalendar(
                        createCombinedTimetable(currentWeek.classes), // Pass all classes
                      )}
                    </Card>
                  </div>
                )}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default CatechistScheduleScreen;

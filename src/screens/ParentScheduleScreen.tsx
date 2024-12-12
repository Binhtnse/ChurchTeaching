import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Card,
  Select,
  message,
  Spin,
  Tag,
} from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import styled from "styled-components";

const { Title, Text } = Typography;
const { Option } = Select;

interface AttendanceData {
  studentAccount: string;
  studentName: string;
  className: string;
  attendanceDetails: AttendanceDetail[];
}

interface AttendanceDetail {
  isAbsent: "ABSENT" | "PRESENT";
  isAbsentWithPermission: "TRUE" | "FALSE";
  time: string;
}

interface AbsenceRequestModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (values: { reason: string }) => Promise<void>;
  selectedStudent: Student | undefined;
  selectedSlot: Slot | null;
  selectedClass: Class | null;
  parentDetails: { email: string; phoneNumber: string } | null;
  submitting: boolean;
  stats: {
    absentWithPermission: number;
    absentWithoutPermission: number;
    totalSessions: number;
  };
}

interface Student {
  id: number;
  fullName: string;
  account: string;
}

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
  isAbsent: string | null;
  isAbsentWithPermission: string | null;
}

interface Class {
  className: string;
  grade: string;
  roomNo: string;
  status: string;
  teacherAccount: string;
  slots: Slot[];
}

interface Grade {
  id: number;
  name: string;
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
  studentClassId: number;
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

const AbsenceRequestModal: React.FC<AbsenceRequestModalProps> = React.memo(
  ({
    isVisible,
    onClose,
    onSubmit,
    selectedStudent,
    selectedSlot,
    selectedClass,
    parentDetails,
    submitting,
    stats,
  }) => {
    const [form] = Form.useForm();

    return (
      <Modal
        title={
          <div className="text-xl font-bold text-blue-600 mb-4">
            Đơn Xin Nghỉ Học
          </div>
        }
        open={isVisible}
        onOk={() => form.submit()}
        onCancel={onClose}
        width={600}
        confirmLoading={submitting}
        okText="Gửi đơn"
        cancelText="Hủy"
        className="custom-modal"
        okButtonProps={{
          className: "bg-blue-600 hover:bg-blue-700",
          size: "large",
        }}
        cancelButtonProps={{ size: "large" }}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Text strong className="w-32">
                    Thiếu nhi:
                  </Text>
                  <Text className="text-blue-600">
                    {selectedStudent?.fullName}
                  </Text>
                </div>
                <div className="flex items-center">
                  <Text strong className="w-32">
                    Ngày nghỉ:
                  </Text>
                  <Text>
                    {selectedSlot?.dayOfWeek} - {selectedSlot?.time}
                  </Text>
                </div>
                <div className="flex items-center">
                  <Text strong className="w-32">
                    Lớp:
                  </Text>
                  <Text>
                    {selectedClass?.className} - {selectedClass?.grade}
                  </Text>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Text strong className="w-48">
                    Số buổi vắng có phép:
                  </Text>
                  <Text className="text-orange-600">
                    {stats.absentWithPermission}
                  </Text>
                </div>
                <div className="flex items-center">
                  <Text strong className="w-48">
                    Số buổi vắng không phép:
                  </Text>
                  <Text className="text-red-600">
                    {stats.absentWithoutPermission}
                  </Text>
                </div>
                <div className="flex items-center">
                  <Text strong className="w-48">
                    Tổng số buổi đã học:
                  </Text>
                  <Text>{stats.totalSessions}</Text>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <Text strong className="w-48">
                  Số điện thoại phụ huynh:
                </Text>
                <Text>{parentDetails?.phoneNumber || "Đang tải..."}</Text>
              </div>
              <div className="flex items-center">
                <Text strong className="w-48">
                  Email phụ huynh:
                </Text>
                <Text>{parentDetails?.email || "Đang tải..."}</Text>
              </div>
            </div>
          </div>

          <Form.Item
            name="reason"
            label={
              <span className="text-base font-medium">Lý do xin nghỉ</span>
            }
            rules={[
              { required: true, message: "Vui lòng nhập lý do xin nghỉ" },
            ]}
          >
            <Input.TextArea
              rows={4}
              className="rounded-lg"
              placeholder="Nhập lý do xin nghỉ..."
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

const ParentScheduleScreen: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null
  );
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [parentDetailsLoading, setParentDetailsLoading] = useState(false);
  console.log(parentDetailsLoading);
  const [modalKey, setModalKey] = useState(0);
  console.log(modalKey);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [parentDetails, setParentDetails] = useState<{
    email: string;
    phoneNumber: string;
  } | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const parentId = user?.id;
      const token = localStorage.getItem("accessToken");
      const yearId = academicYears?.find((year) => year.year === selectedYear)?.id;
  
      if (!parentId) {
        message.error("Không tìm thấy thông tin phụ huynh");
        return;
      }
  
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/user/${parentId}/students${yearId ? `?yearId=${yearId}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents(response.data.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Không thể lấy danh sách thiếu nhi");
      setLoading(false);
    }
  }, [selectedYear, academicYears]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

  const fetchAttendanceData = useCallback(
    async (studentId: number) => {
      if (!selectedStudent || !selectedYear) return;

      const yearId = academicYears?.find(
        (year) => year.year === selectedYear
      )?.id;
      if (!yearId) return;

      // Get the current class's grade name from scheduleData
      const currentClass = scheduleData?.schedule?.[0]?.classes?.[0];
      const gradeName = currentClass?.grade;

      // Find matching grade ID from grades array
      const gradeId = grades.find(grade => grade.name === gradeName)?.id || 1;

      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/attendance/info?academicYearId=${yearId}&studentId=${studentId}&gradeId=${gradeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAttendanceData(response.data.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        message.error("Không thể lấy thông tin điểm danh");
      }
    },
    [selectedStudent, selectedYear, academicYears, scheduleData, grades]
);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=30",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.status === "success") {
          setGrades(response.data.data);
        } else {
          message.error("Failed to fetch grades");
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
      }
    };

    fetchGrades();
  }, []);

  const getAttendanceStats = () => {
    if (!attendanceData?.attendanceDetails)
      return {
        totalSessions: 0,
        absentWithPermission: 0,
        absentWithoutPermission: 0,
      };

    const currentDate = new Date();

    const totalSessions = attendanceData.attendanceDetails.filter(
      (detail) => new Date(detail.time) <= currentDate
    ).length;

    const absentWithPermission = attendanceData.attendanceDetails.filter(
      (d) => d.isAbsent === "ABSENT" && d.isAbsentWithPermission === "TRUE"
    ).length;

    const absentWithoutPermission = attendanceData.attendanceDetails.filter(
      (d) => d.isAbsent === "ABSENT" && d.isAbsentWithPermission === "FALSE"
    ).length;

    return {
      totalSessions,
      absentWithPermission,
      absentWithoutPermission,
    };
  };

  const fetchSchedule = useCallback(
    async (studentId: number) => {
      if (!selectedYear) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setScheduleData(null);
        setSelectedWeek(1);
        const token = localStorage.getItem("accessToken");

        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/schedule/student/${studentId}?academicYear=${selectedYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.data && response.data.data.schedule?.length > 0) {
          const adjustedSchedule = {
            ...response.data.data,
            schedule: response.data.data.schedule.map(adjustWeekDates),
          };
          setScheduleData(adjustedSchedule);

          const currentDate = new Date();
          const currentWeek = adjustedSchedule.schedule?.find(
            (week: WeekSchedule) => {
              const startDate = new Date(week.startDate);
              const endDate = new Date(week.endDate);
              return currentDate >= startDate && currentDate <= endDate;
            }
          );
          setSelectedWeek(
            currentWeek
              ? currentWeek.weekNumber
              : adjustedSchedule.schedule[0].weekNumber
          );
        } else {
          message.info("Không tìm thấy lịch học cho thời gian đã chọn");
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        message.error("Không thể lấy lịch học");
      } finally {
        setLoading(false);
      }
    },
    [selectedYear]
  );

  useEffect(() => {
    if (selectedStudent && selectedYear) {
      fetchSchedule(selectedStudent);
    }
  }, [selectedStudent, selectedYear, fetchSchedule]);

  useEffect(() => {
    if (selectedStudent && selectedYear) {
      fetchAttendanceData(selectedStudent);
    }
  }, [fetchAttendanceData, selectedStudent, selectedYear]);

  const fetchParentDetails = async (parentId: number) => {
    setParentDetailsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/user?id=${parentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const parentData = response.data.data;
      setParentDetails({
        email: parentData.email,
        phoneNumber: parentData.phoneNumber,
      });
    } catch (error) {
      console.error("Error fetching parent details:", error);
      message.error("Không thể lấy thông tin liên hệ phụ huynh");
    } finally {
      setParentDetailsLoading(false);
    }
  };

  const adjustWeekDates = (weekData: WeekSchedule) => {
    const endDate = new Date(weekData.endDate);
    endDate.setDate(endDate.getDate() - 1);
    return {
      ...weekData,
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const handleStudentChange = (studentId: number) => {
    setSelectedStudent(studentId);
    if (selectedYear && studentId) {
      fetchSchedule(studentId);
      fetchAttendanceData(studentId);
    }
  };

  const createTimetable = (
    slots: Slot[]
  ): { [key: string]: { [key: string]: Slot | null } } => {
    const days = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      String.fromCharCode(67, 104, 117, 777, 32, 110, 104, 226, 803, 116),
    ];

    if (!slots.length) {
      return days.reduce((acc, day) => {
        acc[day] = {};
        return acc;
      }, {} as { [key: string]: { [key: string]: Slot | null } });
    }
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

  const stats = getAttendanceStats();

  const showModal = (slot: Slot, classItem: Class) => {
    const weekStart = new Date(currentWeek!.startDate);
    const dayIndex = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      "Chủ nhật",
    ].indexOf(slot.dayOfWeek);
    const slotDate = new Date(weekStart);
    slotDate.setDate(weekStart.getDate() + dayIndex);

    const updatedSlot = {
      ...slot,
      actualDate: slotDate,
    };

    setModalKey((prev) => prev + 1);
    setSelectedSlot(updatedSlot);
    setSelectedClass(classItem);
    setIsModalVisible(true);

    const userString = localStorage.getItem("userLogin");
    const user = userString ? JSON.parse(userString) : null;
    if (user?.id) {
      fetchParentDetails(user.id);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const isYearPassed =
    academicYears.find((y) => y.year === selectedYear)?.timeStatus === "PASS";

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
      String.fromCharCode(84, 104, 432, 769, 32, 66, 97, 777, 121),
      String.fromCharCode(67, 104, 117, 777, 32, 110, 104, 226, 803, 116),
    ];

    const times =
      classItem.slots.length === 0
        ? ["Chưa có"]
        : [...new Set(classItem.slots.map((slot) => slot.time))].sort();

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

    if (classItem.slots.length === 0) {
      return (
        <CalendarGrid>
          <CalendarCell />
          {days.map((day, index) => (
            <DayCell key={day}>
              <div>{day}</div>
              <div className="text-sm mt-1">{dates[index]}</div>
            </DayCell>
          ))}
          <TimeCell>Chưa có</TimeCell>
          {days.map((day) => (
            <CalendarCell key={`${day}-no-slots`}>
              <div className="flex items-center justify-center h-full text-gray-500 text-center">
                Lịch học của lớp đang chờ khối trưởng sắp xếp
              </div>
            </CalendarCell>
          ))}
        </CalendarGrid>
      );
    }

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
            {days.map((day) => {
              const CellComponent = CalendarCell;
              const slot = timetable[day]?.[time] ?? null;
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
                        {slot.attendance && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <Text
                              className={`${
                                !slot.attendance?.isAbsent ||
                                slot.attendance.isAbsent === "PRESENT"
                                  ? "text-green-600"
                                  : slot.attendance.isAbsentWithPermission ===
                                    "TRUE"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              } font-medium`}
                            >
                              Trạng thái điểm danh:
                              {!slot.attendance?.isAbsent
                                ? " Chưa điểm danh"
                                : slot.attendance.isAbsent === "PRESENT"
                                ? " Có mặt"
                                : slot.attendance.isAbsentWithPermission ===
                                  "TRUE"
                                ? " Vắng có phép"
                                : " Vắng không phép"}
                            </Text>
                          </div>
                        )}
                        <div className="mt-2">
                          {(!slot.attendance?.isAbsent ||
                            slot.attendance.isAbsent === "ABSENT" ||
                            slot.attendance.isAbsentWithPermission === "TRUE" ||
                            slot.attendance.isAbsentWithPermission ===
                              "FALSE") && (
                            <Button
                              type="primary"
                              icon={<EllipsisOutlined />}
                              size="middle"
                              disabled={isYearPassed}
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                showModal(slot, classItem);
                              }}
                            >
                              Xin nghỉ
                            </Button>
                          )}
                        </div>
                      </div>
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

  const currentWeek = scheduleData?.schedule?.find(
    (week) => week.weekNumber === selectedWeek
  );

  const handleSubmitLeaveRequest = async (values: { reason: string }) => {
    setSubmitting(true);
    try {
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const parentId = user?.id;
      const token = localStorage.getItem("accessToken");

      const payload = {
        parentId: parentId,
        studentClassId: scheduleData?.studentClassId,
        timeTableId: selectedSlot?.timeTableId,
        reason: values.reason,
      };

      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/leave-requests",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "error") {
        message.error(response.data.message || "Không thể gửi đơn xin nghỉ");
      } else {
        message.success("Đã gửi đơn xin nghỉ thành công");
        setIsModalVisible(false);
      }
    } catch (error: unknown) {
      console.error("Error submitting leave request:", error);
      if (error instanceof Error) {
        message.error(
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message || "Không thể gửi đơn xin nghỉ"
        );
      } else {
        message.error("Không thể gửi đơn xin nghỉ");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Lịch Học Của Con
      </h1>

      <div className="flex flex-col space-y-6 mb-6">
        <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
          <div className="space-y-2 p-4">
            <label className="text-sm font-medium text-gray-600">
              Niên khóa
            </label>
            <Select
              className="w-full"
              value={selectedYear}
              onChange={(value) => setSelectedYear(value)}
              placeholder="Chọn niên khóa"
            >
              {academicYears.map((year) => (
                <Select.Option key={year.id} value={year.year}>
                  {year.year}
                  {year.timeStatus === "NOW" && (
                    <Tag color="blue" className="ml-2">
                      Hiện tại
                    </Tag>
                  )}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Card>
        <Select
          style={{ width: 300 }}
          placeholder="Chọn thiếu nhi"
          onChange={handleStudentChange}
          value={selectedStudent}
          className="shadow-sm"
          allowClear
        >
          {students?.map((student) => (
            <Option key={student.id} value={student.id}>
              {student.fullName} ({student.account})
            </Option>
          ))}
        </Select>

        {selectedStudent && (
          <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <div className="space-y-2">
                <div className="mb-4">
                  <Text strong className="text-lg text-blue-600">
                    Niên khóa: {selectedYear}
                  </Text>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Tuần
                </label>
                <Select
                  className="w-full"
                  value={selectedWeek}
                  onChange={(value) => setSelectedWeek(value)}
                  placeholder="Chọn tuần"
                  disabled={!scheduleData?.schedule?.length}
                >
                  {scheduleData?.schedule?.map((week) => (
                    <Select.Option
                      key={week.weekNumber}
                      value={week.weekNumber}
                    >
                      Tuần {week.weekNumber}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>
        )}
        {loading && selectedStudent ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {!selectedStudent && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg font-semibold">Vui lòng chọn thiếu nhi</p>
                <p className="text-sm">
                  Vui lòng chọn thiếu nhi để xem lịch học
                </p>
              </div>
            )}

            {selectedStudent &&
              selectedYear &&
              !scheduleData?.schedule?.length &&
              !loading && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <Title level={4} className="text-gray-600">
                    Không tìm thấy lịch học
                  </Title>
                  <Text className="text-gray-500">
                    Vui lòng chọn niên khóa khác để xem lịch học
                  </Text>
                </div>
              )}

            <AbsenceRequestModal
              isVisible={isModalVisible}
              onClose={() => setIsModalVisible(false)}
              onSubmit={handleSubmitLeaveRequest}
              selectedStudent={students?.find((s) => s.id === selectedStudent)}
              selectedSlot={selectedSlot}
              selectedClass={selectedClass}
              parentDetails={parentDetails}
              submitting={submitting}
              stats={stats}
            />
            {currentWeek && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentScheduleScreen;

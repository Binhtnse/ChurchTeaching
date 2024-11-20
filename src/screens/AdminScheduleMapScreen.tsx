import React, { useCallback, useEffect, useState } from "react";
import { Card, Select, Table, Input, message, Tag, Button, Modal } from "antd";
import axios from "axios";
import { format } from "date-fns";

interface Lesson {
  id: number;
  name: string;
  slotType: string;
  examName: string | null;
  sessionUnits: number;
}

const slotTypeMap: Record<string, string> = {
  exam: "Kiểm tra",
  lesson_and_exam: "Học và kiểm tra",
  Lesson: "Bài học",
};

interface Schedule {
  id: number;
  name: string | null;
  time: string;
  orderSchedule: number;
}

interface MappingResult {
  orderSchedule: number;
  idSlot: number | null;
  note: string;
}

interface PreviewItem {
  orderSchedule: number;
  lessonName: string;
  additionalActivity?: string;
  examName: string | null;
}

const customStyles = {
  statsCard:
    "text-center p-6 rounded-xl border border-indigo-100 bg-white hover:shadow-xl transition-all duration-300",
  statsNumber: "text-3xl font-bold",
  statsLabel: "text-gray-600 font-medium mt-2",
  sectionTitle: "text-xl font-semibold text-indigo-700 mb-4",
  tableWrapper:
    "bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100",
  actionButton:
    "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300",
};

const AdminScheduleMapScreen: React.FC = () => {
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [remainingSlots, setRemainingSlots] = useState(0);
  const [activities, setActivities] = useState<{ [key: number]: string }>({});
  const [mappingResults, setMappingResults] = useState<MappingResult[]>([]);
  console.log(mappingResults);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
  const [showAdditionalActivityModal, setShowAdditionalActivityModal] =
    useState(false);
  const [additionalActivities, setAdditionalActivities] = useState<
    Record<number, string>
  >({});
  const [currentSchedule] = useState<Schedule | null>(null);
  const [currentLesson] = useState<Lesson | null>(null);
  const [nextLesson] = useState<Lesson | null>(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const fetchGrades = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=10"
      );
      if (response.data.status === "success") {
        setGrades(response.data.data);
      }
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch grades");
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      const nextYears = response.data.filter(
        (year: { timeStatus: string }) => year.timeStatus === "NEXT"
      );
      setAcademicYears(nextYears);
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch academic years");
    }
  };

  const fetchData = useCallback(async () => {
    if (!selectedGrade || !selectedYear) return;

    try {
      const [lessonsResponse, schedulesResponse] = await Promise.all([
        axios.get(
          `https://sep490-backend-production.up.railway.app/api/syllabus/get-lesson?gradeId=${selectedGrade}&yearId=${selectedYear}`
        ),
        axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/timetable/get-schedule?gradeId=${selectedGrade}&yearId=${selectedYear}`
        ),
      ]);

      setLessons(lessonsResponse.data.data.slotDTOList);
      setSchedules(schedulesResponse.data.data);

      const totalSessionUnits = lessonsResponse.data.data.slotDTOList.reduce(
        (sum: number, lesson: Lesson) => sum + lesson.sessionUnits,
        0
      );

      setTotalSessions(totalSessionUnits);
      setRemainingSlots(
        schedulesResponse.data.data.length - Math.ceil(totalSessionUnits)
      );
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch data");
    }
  }, [selectedGrade, selectedYear]);

  useEffect(() => {
    fetchGrades();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedGrade && selectedYear) {
      fetchData();
    }
  }, [fetchData, selectedGrade, selectedYear]);

  const handleActivityChange = (scheduleId: number, value: string) => {
    const newActivities = {
      ...activities,
      [scheduleId]: value,
    };
    setActivities(newActivities);

    // Count slots with activities
    const slotsWithActivities = Object.values(newActivities).filter(
      (activity) => activity.trim() !== ""
    ).length;

    // Calculate remaining slots: total slots - (lessons sessions + slots with activities)
    const remaining =
      schedules.length - (Math.ceil(totalSessions) + slotsWithActivities);
    setRemainingSlots(remaining);
  };

  const handleAutoMap = () => {
    const results: MappingResult[] = [];
    let currentLessonIndex = 0;

    schedules.forEach((schedule) => {
      // If this slot has a user-defined activity, add it directly
      if (activities[schedule.id]) {
        results.push({
          orderSchedule: schedule.orderSchedule,
          idSlot: null,
          note: activities[schedule.id],
        });
        return;
      }

      // Skip if we've used all lessons
      if (currentLessonIndex >= lessons.length) {
        results.push({
          orderSchedule: schedule.orderSchedule,
          idSlot: null,
          note: "",
        });
        return;
      }

      const currentLesson = lessons[currentLessonIndex];
      const nextLesson = lessons[currentLessonIndex + 1];

      if (currentLesson.sessionUnits === 0.5) {
        if (nextLesson && nextLesson.sessionUnits === 0.5) {
          results.push({
            orderSchedule: schedule.orderSchedule,
            idSlot: currentLesson.id,
            note: "",
          });
          results.push({
            orderSchedule: schedule.orderSchedule,
            idSlot: nextLesson.id,
            note: "",
          });
          currentLessonIndex += 2;
        } else {
          results.push({
            orderSchedule: schedule.orderSchedule,
            idSlot: currentLesson.id,
            note: additionalActivities[schedule.id] || "",
          });
          currentLessonIndex++;
        }
      } else {
        results.push({
          orderSchedule: schedule.orderSchedule,
          idSlot: currentLesson.id,
          note: "",
        });
        currentLessonIndex++;
      }
    });

    setMappingResults(results);
    generatePreview(results);
  };

  const handleAdditionalActivityChange = (
    scheduleId: number,
    value: string
  ) => {
    setAdditionalActivities((prev) => ({
      ...prev,
      [scheduleId]: value,
    }));
  };

  const handleAdditionalActivitySubmit = () => {
    // Handle the submission logic here
    setShowAdditionalActivityModal(false);
  };

  const generatePreview = (results: MappingResult[]) => {
    const preview = results.map((result) => {
      const lesson = lessons.find((l) => l.id === result.idSlot);
      return {
        orderSchedule: result.orderSchedule,
        lessonName: lesson ? lesson.name : "Hoạt động khác",
        additionalActivity: result.note,
        examName: lesson ? lesson.examName : "",
      };
    });
    setPreviewData(preview);
    setShowPreview(true);
  };

  const handleSubmitSchedule = async () => {
    try {
      const formattedResults = mappingResults.map((result) => ({
        orderSchedule: result.orderSchedule,
        idSlot: result.idSlot || null,
        note: result.note || "",
      }));

      const response = await axios.post(
        `https://sep490-backend-production.up.railway.app/api/time-table-detail?gradeId=${selectedGrade}&yearId=${selectedYear}`,
        formattedResults
      );

      message.success(
        response.data.message || "Lịch học đã được lưu thành công"
      );
      setIsConfirmModalVisible(false);
    } catch (error) {
      console.log(error);
      message.error("Không thể lưu lịch học. Vui lòng thử lại");
    }
  };

  const lessonColumns = [
    {
      title: "STT",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
      width: 70,
    },
    {
      title: "Tên bài",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "slotType",
      key: "slotType",
      render: (text: string) => {
        const displayText = slotTypeMap[text] || text;
        return <Tag color="blue">{displayText}</Tag>;
      },
    },
    {
      title: "Tên bài kiểm tra",
      dataIndex: "examName",
      key: "examName",
      render: (text: string | null) => text || "Không kiểm tra",
    },
  ];

  const scheduleColumns = [
    {
      title: "STT",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
      width: 70,
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      render: (text: string) => format(new Date(text), "dd/MM/yyyy"),
    },
    {
      title: "Hoạt động",
      key: "activity",
      render: (_: unknown, record: Schedule) => (
        <Input
          placeholder="Nhập hoạt động"
          value={activities[record.id] || ""}
          onChange={(e) => handleActivityChange(record.id, e.target.value)}
          disabled={remainingSlots <= 0 && !activities[record.id]}
        />
      ),
    },
  ];

  const previewColumns = [
    {
      title: "Buổi",
      dataIndex: "orderSchedule",
      key: "orderSchedule",
    },
    {
      title: "Nội dung",
      dataIndex: "lessonName",
      key: "lessonName",
      render: (_: string, record: PreviewItem) => {
        const lesson = lessons.find(l => l.name === record.lessonName);
        if (lesson?.examName) {
          return (
            <div>
              <div>{record.lessonName}</div>
              <Tag color="orange">{lesson.examName}</Tag>
            </div>
          );
        }
        return record.lessonName;
      }
    },
    {
      title: "Hoạt động bổ sung",
      dataIndex: "additionalActivity",
      key: "additionalActivity",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
          Lập lịch giảng dạy
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
                onChange={setSelectedYear}
                value={selectedYear}
              >
                {academicYears.map((year) => (
                  <Select.Option key={year.id} value={year.id}>
                    {year.year}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Khối</label>
              <Select
                className="w-full"
                placeholder="Chọn khối"
                onChange={setSelectedGrade}
                value={selectedGrade}
              >
                {grades.map((grade) => (
                  <Select.Option key={grade.id} value={grade.id}>
                    {grade.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {selectedGrade && selectedYear && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={customStyles.statsCard}>
                <div className={customStyles.statsNumber}>
                  {schedules.length}
                </div>
                <div className={customStyles.statsLabel}>Tổng số buổi học</div>
              </div>
              <div className={customStyles.statsCard}>
                <div className={`${customStyles.statsNumber} text-green-600`}>
                  {totalSessions}
                </div>
                <div className={customStyles.statsLabel}>
                  Thời lượng các bài học (theo số buổi)
                </div>
              </div>
              <div className={customStyles.statsCard}>
                <div className={`${customStyles.statsNumber} text-orange-600`}>
                  {remainingSlots}
                </div>
                <div className={customStyles.statsLabel}>Số buổi trống</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className={customStyles.sectionTitle}>Danh sách bài học</h2>
                <div className={customStyles.tableWrapper}>
                  <Table
                    columns={lessonColumns}
                    dataSource={lessons}
                    rowKey="id"
                    pagination={false}
                  />
                </div>
              </div>
              <div>
                <h2 className={customStyles.sectionTitle}>
                  Danh sách buổi học
                </h2>
                <div className={customStyles.tableWrapper}>
                  <Table
                    columns={scheduleColumns}
                    dataSource={schedules}
                    rowKey="id"
                    pagination={false}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        {selectedGrade && selectedYear && (
          <div className="mt-8 text-center">
            <Button
              type="primary"
              onClick={handleAutoMap}
              className={customStyles.actionButton}
              size="large"
              disabled={remainingSlots !== 0}
              title={
                remainingSlots !== 0
                  ? "Vui lòng điền đầy đủ hoạt động cho các buổi trống trước khi phân bổ"
                  : ""
              }
            >
              Tự động phân bổ
            </Button>

            {showPreview && (
              <div className="mt-8">
                <h2 className={customStyles.sectionTitle}>Kết quả phân bổ</h2>
                <div className={customStyles.tableWrapper}>
                  <Table
                    columns={previewColumns}
                    dataSource={previewData}
                    rowKey="orderSchedule"
                    pagination={false}
                  />
                </div>
                <Button
                  type="primary"
                  onClick={() => setIsConfirmModalVisible(true)}
                  className={`${customStyles.actionButton} ml-4`}
                  size="large"
                  disabled={!mappingResults.length}
                >
                  Lưu lịch học
                </Button>

                <Modal
                  title="Xác nhận lưu lịch học"
                  open={isConfirmModalVisible}
                  onOk={handleSubmitSchedule}
                  onCancel={() => setIsConfirmModalVisible(false)}
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <p>Bạn có chắc chắn muốn lưu lịch học này?</p>
                  <p className="text-red-500">
                    Lưu ý: Việc sắp xếp lịch học chỉ có thể thực hiện một lần
                    trước khi năm học bắt đầu và không thể thay đổi sau khi đã
                    lưu.
                  </p>
                </Modal>
              </div>
            )}

            {currentLesson?.sessionUnits === 0.5 &&
              nextLesson?.sessionUnits !== 0.5 && (
                <Modal
                  title="Thêm hoạt động bổ sung"
                  visible={showAdditionalActivityModal}
                  onOk={handleAdditionalActivitySubmit}
                  onCancel={() => setShowAdditionalActivityModal(false)}
                >
                  <Input
                    placeholder="Nhập hoạt động bổ sung"
                    value={additionalActivities[currentSchedule?.id || 0] || ""}
                    onChange={(e) =>
                      handleAdditionalActivityChange(
                        currentSchedule?.id || 0,
                        e.target.value
                      )
                    }
                  />
                </Modal>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScheduleMapScreen;

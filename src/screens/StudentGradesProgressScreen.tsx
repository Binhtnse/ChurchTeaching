import React, { useState, useEffect, useCallback } from "react";
import { Select, Table, Card, Spin, message, Tag } from "antd";
import axios from "axios";

const { Option } = Select;

interface Grade {
  id: number;
  studentName: string;
  account: string;
  score: number;
  examName: string;
  className: string;
}

interface Class {
  id: number;
  name: string;
  gradeName: string;
}

interface GradeTemplate {
  id: number;
  name: string;
  maxExamCount: number;
  exams: {
    id: number;
    name: string;
    weight: number;
    status: string | null;
    gradeTemplateName: string;
  }[];
}

const StudentGradesProgressScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [gradeTemplate, setGradeTemplate] = useState<GradeTemplate | null>(
    null
  );
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    number | null
  >(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [gradeData, setGradeData] = useState<Grade[]>([]);

  const getCurrentStudentId = () => {
    const userString = localStorage.getItem("userLogin");
    const user = userString ? JSON.parse(userString) : null;
    return user?.id;
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      setAcademicYears(response.data);
    } catch (error) {
      console.log(error);
      message.error("Không thể lấy danh sách niên khóa");
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=30",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.status === "success") {
        setGrades(response.data.data);
      }
    } catch (error) {
      console.log(error);
      message.error("Không thể lấy danh sách khối");
    }
  };

  const fetchSyllabus = useCallback(async () => {
    if (!selectedAcademicYear || !selectedGrade) return;
    
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/syllabus?status=ACTIVE&page=1&size=10&gradeId=${selectedGrade}&yearId=${selectedAcademicYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.data.status === "success" && response.data.data.length > 0) {
        const syllabusData = response.data.data[0];
        const templateId = syllabusData.syllabus.gradeTemplate.id;
        // Pass the template ID to fetchGradeTemplate
        fetchGradeTemplate(templateId);
      }
    } catch (error) {
      console.error("Failed to fetch syllabus:", error);
      message.error("Không thể lấy thông tin giáo án");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAcademicYear, selectedGrade]);

  const fetchClasses = useCallback(async () => {
    if (!selectedAcademicYear || !selectedGrade) return;
    const studentId = getCurrentStudentId();
    const token = localStorage.getItem("accessToken");
    try {
      // Get student's class IDs
      const studentClassesResponse = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/student/${studentId}/classes?academicYearId=${selectedAcademicYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const studentClassIds = studentClassesResponse.data.data;
  
      // Get all classes
      const allClassesResponse = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/list?page=1&size=100&academicYearId=${selectedAcademicYear}&gradeId=${selectedGrade}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Show only classes the student belongs to
      const filteredClasses = allClassesResponse.data.data.filter((classItem: Class) =>
        studentClassIds.includes(classItem.id)
      );
  
      if (filteredClasses.length === 0) {
        setClasses([]);
        message.info("Không tìm thấy lớp học nào cho thiếu nhi này");
        return;
      }
  
      setClasses(filteredClasses);
    } catch (error) {
      console.log(error);
      setClasses([]);
      message.error("Không thể lấy danh sách lớp");
    }
  }, [selectedAcademicYear, selectedGrade]);

  const fetchGradeTemplate = useCallback(async (templateId: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get<{ data: GradeTemplate }>(
        `https://sep490-backend-production.up.railway.app/api/v1/grade-template/${templateId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setGradeTemplate(response.data.data);
    } catch (error) {
      console.log(error);
      message.error("Không thể lấy thông tin trọng số điểm");
    }
  }, []);

  const fetchGradeData = useCallback(async () => {
    const studentId = getCurrentStudentId();
    if (!studentId || !selectedClass || !selectedAcademicYear || !selectedGrade)
      return;
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/student-grade/student/${studentId}/class/${selectedClass}?page=1&size=10&academicYearId=${selectedAcademicYear}&gradeId=${selectedGrade}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.data.data || response.data.data.length === 0) {
        setGradeData([]);
        return;
      }
      setGradeData(response.data.data);
    } catch (error) {
      setGradeData([]);
      console.log(error);
      message.error("Không thể lấy điểm số");
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedAcademicYear, selectedGrade]);

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear && selectedGrade) {
      fetchSyllabus();
    }
  }, [selectedAcademicYear, selectedGrade, fetchSyllabus]);

  useEffect(() => {
    if (selectedAcademicYear && selectedGrade) {
      fetchClasses();
    }
  }, [selectedAcademicYear, selectedGrade, fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchGradeData();
    }
  }, [selectedClass, fetchGradeData]);

  const calculateTotalScore = () => {
    if (!gradeTemplate || !gradeData.length) return null;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    gradeData.forEach((grade) => {
      const exam = gradeTemplate.exams.find((e) => e.name === grade.examName);
      if (exam) {
        totalWeightedScore += grade.score * exam.weight;
        totalWeight += exam.weight;
      }
    });

    return totalWeight > 0
      ? (totalWeightedScore / totalWeight).toFixed(2)
      : null;
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: "10%",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Tên bài kiểm tra",
      dataIndex: "examName",
      key: "examName",
      render: (examName: string) => {
        const exam = gradeTemplate?.exams.find((e) => e.name === examName);
        return (
          <div>
            <div className="font-medium">{examName}</div>
            {exam && (
              <div className="text-sm text-gray-500">
                Tỷ trọng: {exam.weight * 100}%
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Điểm số",
      dataIndex: "score",
      key: "score",
      render: (score: number, record: Grade) => {
        const exam = gradeTemplate?.exams.find(
          (e) => e.name === record.examName
        );
        const weightedScore = exam ? score * exam.weight : score;
        return (
          <div>
            <span
              className={`font-bold ${
                score >= 5 ? "text-green-600" : "text-red-600"
              }`}
            >
              {score}
            </span>
            <span className="text-gray-500 text-sm ml-2">
              ({weightedScore.toFixed(2)} điểm hệ số)
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4"
      >
        Bảng Điểm Chi Tiết
      </h1>

      <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Niên khóa
            </label>
            <Select
              className="w-full"
              placeholder="Chọn niên khóa"
              onChange={(value) => setSelectedAcademicYear(value)}
              dropdownClassName="rounded-lg shadow-lg"
            >
              {academicYears?.map((year) => (
                <Option key={year.id} value={year.id}>
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
            <label className="text-sm font-medium text-gray-600">Khối</label>
            <Select
              className="w-full"
              placeholder="Chọn khối"
              onChange={(value) => setSelectedGrade(value)}
              value={selectedGrade}
            >
              {grades.map((grade) => (
                <Option key={grade.id} value={grade.id}>
                  {grade.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Lớp</label>
            <Select
              className="w-full"
              placeholder="Chọn lớp"
              onChange={(value) => setSelectedClass(value)}
              value={selectedClass}
              disabled={!selectedAcademicYear || !selectedGrade}
            >
              {classes.map((cls) => (
                <Option key={cls.id} value={cls.id}>
                  {cls.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg">
          <Spin size="large" />
        </div>
      ) : (
        <Card className="shadow-lg rounded-xl border border-indigo-100">
          {gradeData.length > 0 ? (
            <>
              <div className="mb-4">
                <div className="text-lg font-medium text-indigo-700 mb-2">
                  Tổng quan điểm số
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gradeTemplate?.exams.map((exam) => {
                    const examScore = gradeData.find(
                      (g) => g.examName === exam.name
                    )?.score;
                    return (
                      <Card
                        key={exam.id}
                        className="bg-gray-50 border border-gray-200"
                      >
                        <div className="text-sm font-medium">{exam.name}</div>
                        <div className="text-xl font-bold mt-1">
                          {examScore !== undefined ? (
                            <span
                              className={
                                examScore >= 5
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {examScore}
                            </span>
                          ) : (
                            "-"
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <Table
                dataSource={gradeData}
                columns={columns}
                rowKey="id"
                pagination={false}
                className="border rounded-lg"
                rowClassName="hover:bg-blue-50 transition-colors"
              />
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-medium text-indigo-700">
                    Điểm tổng kết
                  </div>
                  <div className="text-3xl font-bold">
                    {calculateTotalScore() ? (
                      <span
                        className={
                          Number(calculateTotalScore()) >= 5
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {calculateTotalScore()}
                      </span>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">
                Không tìm thấy dữ liệu điểm số cho bộ lọc đã chọn
              </div>
              <div className="text-gray-500 text-sm mt-2">
                Vui lòng kiểm tra lại các thông tin đã chọn
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentGradesProgressScreen;

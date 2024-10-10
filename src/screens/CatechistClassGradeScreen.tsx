import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Typography,
  Spin,
  message,
  Pagination,
  Select,
  Button,
  Input,
} from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";

const { Title } = Typography;
const { Option } = Select;

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

interface Student {
  id: number;
  studentClassId: number;
  fullName: string;
  account: string;
  status: string;
}

interface AcademicYear {
  id: number;
  year: string;
  timeStatus: string;
}

interface Class {
  id: number;
  name: string;
  numberOfCatechist: number;
  gradeName: string;
  academicYear: string;
  status: string;
}

interface Grade {
  id: number;
  name: string;
  age: number;
  level: string;
  description: string;
  syllabusName: string;
  major: {
    id: number;
    name: string;
    ageRange: string;
    description: string;
  };
}

interface StudentGrade {
  id: number;
  studentName: string;
  account: string;
  score: number;
  examName: string;
  className: string;
  scores: { [examName: string]: number };
}

interface ApiResponse {
  status: string;
  message: string | null;
  timestamp: string;
  pageResponse: {
    currentPage: number;
    totalPage: number;
    pageSize: number;
    nextPage: number | null;
    previousPage: number | null;
  };
  data: StudentGrade[];
}

const CatechistClassGradeScreen: React.FC = () => {
  const [classGrades, setClassGrades] = useState<StudentGrade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    number | null
  >(null);
  const [gradeTemplate, setGradeTemplate] = useState<GradeTemplate | null>(
    null
  );
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { isLoggedIn, role, checkAuthState } = useAuthState();

  const toggleEditing = () => {
  if (isEditing) {
    // If cancelling, revert changes by re-fetching data
    fetchClassGrades(pagination.current, pagination.pageSize);
  }
  setIsEditing(!isEditing);
};

  const saveChanges = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem('accessToken');
  
    try {
      const savePromises = classGrades.map(async (student) => {
        const exams = gradeTemplate?.exams?.map(exam => ({
          examId: exam.id,
          score: student.scores[exam.name] || 0
        })) || [];
  
        await axios.post(
          'https://sep490-backend-production.up.railway.app/api/v1/student-grade',
          {
            studentClassId: student.id,
            exams: exams
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      });
  
      await Promise.all(savePromises);
      message.success('Changes saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      message.error('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      setAcademicYears(response.data);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      message.error("Failed to fetch academic years");
    }
  };

  const fetchClassGrades = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (isLoggedIn && role === "CATECHIST" && selectedClass) {
        setLoading(true);
        try {
          const accessToken = localStorage.getItem("accessToken");
          const [gradesResponse, studentsResponse] = await Promise.all([
            axios.get<ApiResponse>(
              `https://sep490-backend-production.up.railway.app/api/v1/student-grade/class/${selectedClass}?page=${page}&size=${pageSize}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            ),
            axios.get(
              `https://sep490-backend-production.up.railway.app/api/v1/class/get-students?classId=${selectedClass}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            ),
          ]);
          const mergedGrades = mergeStudentGrades(gradesResponse.data.data);
          const students = studentsResponse.data.data.students;
          const combinedData = students.map((student: Student) => {
            const gradeData = mergedGrades.find(
              (grade) => grade.account === student.account
            ) || { scores: {} };
            return { ...student, ...gradeData };
          });

          setClassGrades(combinedData);
          setPagination((prevPagination) => ({
            ...prevPagination,
            total: gradesResponse.data.pageResponse.totalPage * pageSize,
            current: page,
            pageSize: pageSize,
          }));
          setLoading(false);
        } catch (error) {
          console.error("Error fetching grades and students:", error);
          message.error("Failed to load grade and student data");
          setLoading(false);
        }
      }
    },
    [isLoggedIn, role, selectedClass]
  );

  const fetchClasses = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (
        isLoggedIn &&
        role === "CATECHIST" &&
        selectedAcademicYear &&
        selectedGrade
      ) {
        setLoading(true);
        try {
          const accessToken = localStorage.getItem("accessToken");
          const response = await axios.get(
            `https://sep490-backend-production.up.railway.app/api/v1/class/list?page=${page}&size=${pageSize}&academicYearId=${selectedAcademicYear}&gradeId=${selectedGrade}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setClasses(response.data.data);
          setPagination((prevPagination) => ({
            ...prevPagination,
            total: response.data.pageResponse.totalPage * pageSize,
            current: page,
            pageSize: pageSize,
          }));
          setLoading(false);
        } catch (error) {
          console.error("Error fetching classes:", error);
          message.error("Failed to load class data");
          setLoading(false);
        }
      }
    },
    [isLoggedIn, role, selectedAcademicYear, selectedGrade]
  );

  const fetchGrades = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/grade",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setGrades(response.data.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
      message.error("Failed to load grades");
    }
  }, []);

  useEffect(() => {
    checkAuthState();
    fetchAcademicYears();
    fetchGrades();
  }, [checkAuthState, fetchGrades]);

  const handleGradeChange = (value: number) => {
    setSelectedGrade(value);
  };

  const mergeStudentGrades = (grades: StudentGrade[]): StudentGrade[] => {
    const mergedGrades: { [key: string]: StudentGrade } = {};

    grades.forEach((grade) => {
      const key = `${grade.studentName}-${grade.account}`;
      if (!mergedGrades[key]) {
        mergedGrades[key] = { ...grade, scores: {} };
      }
      mergedGrades[key].scores[grade.examName] = grade.score;
    });

    return Object.values(mergedGrades);
  };

  const fetchGradeTemplate = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get<{ data: GradeTemplate[] }>(
        `https://sep490-backend-production.up.railway.app/api/v1/grade-template/list?page=1&size=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setGradeTemplate(response.data.data[0]);
    } catch (error) {
      console.error("Error fetching grade template:", error);
      message.error("Failed to load grade template data");
    }
  }, []);

  const handleScoreChange = (
    studentId: number,
    examName: string,
    value: string
  ) => {
    const newValue = parseFloat(value) || 0;
    setClassGrades((prevGrades) =>
      prevGrades.map((grade) =>
        grade.id === studentId
          ? { ...grade, scores: { ...grade.scores, [examName]: newValue } }
          : grade
      )
    );
  };

  useEffect(() => {
    if (selectedAcademicYear && selectedGrade) {
      fetchClasses(1, pagination.pageSize);
    }
  }, [fetchClasses, selectedAcademicYear, selectedGrade, pagination.pageSize]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassGrades(1, pagination.pageSize);
      fetchGradeTemplate();
    }
  }, [
    fetchClassGrades,
    fetchGradeTemplate,
    selectedClass,
    pagination.pageSize,
  ]);

  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchClasses(page, pageSize || pagination.pageSize);
  };

  const handleAcademicYearChange = (value: number) => {
    setSelectedAcademicYear(value);
  };

  const handleClassChange = (value: number) => {
    setSelectedClass(value);
  };

  const classGradeColumns = [
    {
      title: "STT",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Tên thiếu nhi",
      dataIndex: "studentName",
      key: "studentName",
    },
    ...(gradeTemplate?.exams?.map((exam) => ({
      title: exam.name,
      dataIndex: ["scores", exam.name],
      key: exam.name,
      render: (score: number, record: StudentGrade) =>
        isEditing ? (
          <Input
            defaultValue={score || ""}
            onChange={(e) =>
              handleScoreChange(record.id, exam.name, e.target.value)
            }
          />
        ) : (
          score || "-"
        ),
    })) || []),
    {
      title: "Tổng điểm",
      key: "totalScore",
      render: (record: StudentGrade) => {
        const totalScore = gradeTemplate?.exams?.reduce((acc, exam) => {
          return acc + (record.scores?.[exam.name] || 0) * (exam.weight || 0);
        }, 0);
        return totalScore?.toFixed(2) || "-";
      },
    },
  ];

  const classColumns = [
    {
      title: "STT",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Tên lớp",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số lượng giáo lý viên",
      dataIndex: "numberOfCatechist",
      key: "numberOfCatechist",
    },
    {
      title: "Tên khối",
      dataIndex: "gradeName",
      key: "gradeName",
    },
    {
      title: "Niên khóa",
      dataIndex: "academicYear",
      key: "academicYear",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
  ];

  if (!isLoggedIn || role !== "CATECHIST") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        Danh sách lớp học và điểm số
      </Title>
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200, marginRight: 16 }}
          placeholder="Chọn niên khóa"
          onChange={handleAcademicYearChange}
        >
          {academicYears.map((year) => (
            <Option key={year.id} value={year.id}>
              {year.year} {year.timeStatus === "NOW" ? "(Hiện tại)" : ""}
            </Option>
          ))}
        </Select>
        <Select
          style={{ width: 200, marginRight: 16 }}
          placeholder="Chọn khối"
          onChange={handleGradeChange}
        >
          {grades.map((grade) => (
            <Option key={grade.id} value={grade.id}>
              {grade.name}
            </Option>
          ))}
        </Select>
        {classes.length > 0 && (
          <Select
            style={{ width: 200 }}
            placeholder="Chọn lớp"
            onChange={handleClassChange}
          >
            {classes.map((classItem) => (
              <Option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </Option>
            ))}
          </Select>
        )}
      </div>
      <Spin spinning={loading}>
        {!selectedClass ? (
          <Table
            columns={classColumns}
            dataSource={classes}
            rowKey="id"
            pagination={false}
            className="bg-white shadow-md rounded-lg"
          />
        ) : (
          <>
            <Button 
  onClick={isEditing ? saveChanges : toggleEditing} 
  style={{ marginBottom: 16 }}
>
  {isEditing ? 'Lưu thay đổi' : 'Ghi nhận điểm'}
</Button>
            <Table
              columns={classGradeColumns}
              dataSource={classGrades}
              rowKey="id"
              pagination={false}
              className="bg-white shadow-md rounded-lg"
            />
          </>
        )}
        <Pagination
          current={pagination.current}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onChange={handlePaginationChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `Total ${total} items`}
          className="mt-4 text-right"
        />
      </Spin>
    </div>
  );
};
export default CatechistClassGradeScreen;
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Typography,
  Spin,
  message,
  Button,
  Input,
  Pagination,
} from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { useParams } from "react-router-dom";

const { Title } = Typography;

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

interface StudentGrade {
  id: number;
  studentName: string;
  account: string;
  score: number;
  examName: string;
  className: string;
  scores: { [examName: string]: number };
}

const CatechistClassGradeScreen: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [classGrades, setClassGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [allCellsFilled, setAllCellsFilled] = useState(false);
  const [gradeTemplate, setGradeTemplate] = useState<GradeTemplate | null>(
    null
  );
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const toggleEditing = () => {
    if (isEditing) {
      fetchClassGrades();
    }
    setIsEditing(!isEditing);
  };

  const saveChanges = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken");

    try {
      const savePromises = classGrades.map(async (student) => {
        const exams =
          gradeTemplate?.exams?.map((exam) => ({
            examId: exam.id,
            score: student.scores[exam.name] || 0,
          })) || [];

        await axios.post(
          "https://sep490-backend-production.up.railway.app/api/v1/student-grade",
          {
            studentClassId: student.id,
            exams: exams,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      });

      await Promise.all(savePromises);
      message.success("Changes saved successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      message.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const checkAllCellsFilled = useCallback(() => {
    const allFilled = classGrades.every((student) =>
      gradeTemplate?.exams?.every(
        (exam) => student.scores[exam.name] !== undefined
      )
    );
    setAllCellsFilled(allFilled);
  }, [classGrades, gradeTemplate]);

  useEffect(() => {
    checkAllCellsFilled();
  }, [classGrades, gradeTemplate, checkAllCellsFilled]);

  const fetchClassGrades = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (isLoggedIn && role === "CATECHIST" && classId) {
        setLoading(true);
        try {
          const accessToken = localStorage.getItem("accessToken");
          const [studentsResponse, gradesResponse] = await Promise.all([
            axios.get(
              `https://sep490-backend-production.up.railway.app/api/v1/class/get-students?classId=${classId}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            ),
            axios.get(
              `https://sep490-backend-production.up.railway.app/api/v1/student-grade/class/${classId}?page=${page}&size=${pageSize}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            ),
          ]);

          const students = studentsResponse.data.data.students;
          const grades = gradesResponse.data.data;

          const gradeMap = new Map();
          grades.forEach((grade: StudentGrade) => {
            if (!gradeMap.has(grade.account)) {
              gradeMap.set(grade.account, { scores: {} });
            }
            gradeMap.get(grade.account).scores[grade.examName] = grade.score;
          });

          const combinedData = students.map((student: Student) => {
            const gradeData = gradeMap.get(student.account) || { scores: {} };
            return {
              ...student,
              ...gradeData,
              scores: gradeData.scores,
            };
          });

          setClassGrades(combinedData);
          setPagination({
            current: gradesResponse.data.pageResponse.currentPage,
            pageSize: gradesResponse.data.pageResponse.pageSize,
            total: studentsResponse.data.data.students.length,
          });
        } catch (error) {
          console.error("Error fetching data:", error);
          message.error("Failed to load data");
        } finally {
          setLoading(false);
        }
      }
    },
    [isLoggedIn, role, classId]
  );

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

  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchClassGrades(page, pageSize || pagination.pageSize);
  };

  const handleFinalize = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `https://sep490-backend-production.up.railway.app/api/v1/student-grade/finalize/class/${classId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success("Grades finalized successfully");
      // Optionally, you can refresh the data or update the UI state here
    } catch (error) {
      console.error("Error finalizing grades:", error);
      message.error("Failed to finalize grades");
    }
  };

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
    checkAllCellsFilled();
  };

  useEffect(() => {
    checkAuthState();
    if (classId) {
      fetchClassGrades();
      fetchGradeTemplate();
    }
  }, [checkAuthState, fetchClassGrades, fetchGradeTemplate, classId]);

  const classGradeColumns = [
    {
      title: "STT",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Tên thiếu nhi",
      dataIndex: "fullName",
      key: "fullName",
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

  if (!isLoggedIn || role !== "CATECHIST") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        Danh sách điểm số
      </Title>
      <Spin spinning={loading}>
        <Button
          onClick={isEditing ? saveChanges : toggleEditing}
          style={{ marginBottom: 16 }}
        >
          {isEditing ? "Lưu thay đổi" : "Ghi nhận điểm"}
        </Button>
        {allCellsFilled && (
          <Button onClick={handleFinalize} style={{ marginBottom: 16 }}>
            Tổng kết
          </Button>
        )}
        <Table
          columns={classGradeColumns}
          dataSource={classGrades}
          rowKey="id"
          pagination={false}
          className="bg-white shadow-md rounded-lg"
        />
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

import React, { useEffect, useState, useCallback} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Typography,
  Spin,
  message,
  Button,
  Input,
  Pagination,
} from "antd";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";

const { Title } = Typography;

interface Student {
  studentId: number;
  studentClassId: number;
  fullName: string;
  account: string;
  status: string;
  scores: {
    [key: string]: { examId: number; score: number | undefined };
  };
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

interface Grade {
  account: string;
  examId: number;
  examName: string;
  score: number;
}

const CatechistClassGradeScreen: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { isLoggedIn, role } = useAuthState();
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeTemplate, setGradeTemplate] = useState<GradeTemplate | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [allCellsFilled, setAllCellsFilled] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchClassGrades = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      const [studentsResponse, gradesResponse] = await Promise.all([
        axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/class/get-students?classId=${classId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        ),
        axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/student-grade/class/${classId}?page=1&size=1000`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
      ]);
  
      const students = studentsResponse.data.data.students;
      const grades = gradesResponse.data.data;
  
      console.log("Raw grades data:", grades);
  
      const combinedStudents = students.map((student: Student) => {
        const scores = {};
        gradeTemplate?.exams.forEach((exam) => {
          const grade = grades.find((g: Grade) => g.account === student.account && g.examName === exam.name);
          (scores as Record<string, { examId: number; score: number | undefined }>)[exam.name] = {
            examId: exam.id,
            score: grade ? grade.score : undefined
          };
        });
        return { ...student, scores };
      });
  
      console.log("Combined students with scores:", combinedStudents);
  
      setStudents(combinedStudents);
      setPagination(prev => ({
        ...prev,
        current: 1,
        pageSize: combinedStudents.length,
        total: combinedStudents.length,
      }));
    } catch (error) {
      console.error("Failed to fetch class grades:", error);
      message.error("Failed to fetch class grades");
    } finally {
      setLoading(false);
    }
  }, [classId, gradeTemplate]);  

  const fetchGradeTemplate = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get<{ data: GradeTemplate }>(
        `https://sep490-backend-production.up.railway.app/api/v1/grade-template/1`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setGradeTemplate(response.data.data);
      console.log("Grade template fetched:", response.data.data);
    } catch (error) {
      console.error("Failed to fetch grade template:", error);
      message.error("Failed to fetch grade template");
    }
  }, []);   

  useEffect(() => {
    if (isLoggedIn && role === "CATECHIST" && classId) {
      fetchGradeTemplate();
    }
  }, [isLoggedIn, role, classId, fetchGradeTemplate]);

  useEffect(() => {
    if (gradeTemplate && classId) {
      fetchClassGrades();
    }
  }, [gradeTemplate, classId, fetchClassGrades]);

  const toggleEditing = () => {
    if (isEditing) {
      fetchClassGrades();
    }
    setIsEditing(!isEditing);
  };

  const saveGrades = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
  
      const changedScores = students
        .filter(student => 
          Object.values(student.scores).some(score => score.score !== undefined)
        )
        .map((student) => ({
          studentClassId: student.studentClassId,
          exams: Object.entries(student.scores)
            .filter(([, score]) => score.score !== undefined)
            .map(([, score]) => ({
              examId: score.examId,
              score: score.score,
            })),
        }));
  
      console.log("Data to be sent for saveGrades:", { studentClassScores: changedScores });
  
      if (changedScores.length > 0) {
        await axios.put(
          "https://sep490-backend-production.up.railway.app/api/v1/student-grade",
          { studentClassScores: changedScores },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
  
        message.success("Thay đổi thành công");
      } else {
        message.info("No changes to save");
      }
  
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save grades:", error);
      message.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };   

  const handleScoreChange = useCallback(
    (
      studentClassId: number,
      examId: number,
      examName: string,
      value: string
    ) => {
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.studentClassId === studentClassId
            ? {
                ...student,
                scores: {
                  ...student.scores,
                  [examName]: {
                    examId,
                    score: value === "" ? undefined : parseFloat(value),
                  },
                },
              }
            : student
        )
      );
    },
    []
  );

  const checkAllCellsFilled = useCallback(() => {
    const allFilled = students.every((student) =>
      gradeTemplate?.exams?.every(
        (exam) => student.scores[exam.name] !== undefined
      )
    );
    setAllCellsFilled(allFilled);
  }, [students, gradeTemplate]);

  useEffect(() => {
    checkAllCellsFilled();
  }, [students, checkAllCellsFilled]);

  const handlePaginationChange = () => {
    fetchClassGrades();
  };

  const handleFinalize = async () => {
    try {
      // Implement finalize logic here
      message.success("Grades finalized successfully");
    } catch (error) {
      console.error("Failed to finalize grades:", error);
      message.error("Failed to finalize grades");
    }
  };

  const EditableCell: React.FC<{
    value: number | undefined | null;
    onChange: (value: string) => void;
    studentClassId: number;
    examId: number;
    examName: string;
  }> = React.memo(({ value, onChange }) => (
    <Input
      value={value !== null && value !== undefined ? value.toString() : ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => {
        const numValue = parseFloat(e.target.value);
        if (!isNaN(numValue)) {
          onChange(numValue.toString());
        }
      }}
    />
  ));

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
      render: (
        scoreObj: { examId: number; score: number | undefined } | undefined,
        record: Student
      ) =>
        isEditing ? (
          <EditableCell
            key={`${record.studentClassId}-${exam.name}`}
            value={scoreObj?.score}
            onChange={(value) =>
              handleScoreChange(
                record.studentClassId,
                exam.id,
                exam.name,
                value
              )
            }
            studentClassId={record.studentClassId}
            examId={exam.id}
            examName={exam.name}
          />
        ) : (
          scoreObj?.score ?? "-"
        ),
    })) || []),    
    {
      title: "Tổng điểm",
      key: "totalScore",
      render: (record: Student) => {
        const totalScore = gradeTemplate?.exams?.reduce((acc, exam) => {
          const score = record.scores[exam.name]?.score || 0;
          return acc + score * (exam.weight || 0);
        }, 0);
        return totalScore !== undefined ? totalScore.toFixed(2) : "-";
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
          onClick={isEditing ? saveGrades : toggleEditing}
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
          dataSource={students}
          rowKey="studentClassId"
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

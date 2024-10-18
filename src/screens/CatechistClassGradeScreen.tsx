import React, { useEffect, useState, useCallback } from "react";
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
  id: number;
  studentId: number;
  studentClassId: number;
  fullName: string;
  account: string;
  status: string;
  scores: { [key: string]: { examId: number; score: number | undefined } };
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

const CatechistClassGradeScreen: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { isLoggedIn, role } = useAuthState();
  const [students, setStudents] = useState<Student[]>([]);
  const [gradeTemplate, setGradeTemplate] = useState<GradeTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [allCellsFilled, setAllCellsFilled] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchClassGrades = useCallback(async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/student-grade/class/${classId}?page=${page}&size=${pageSize}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
  
      const grades = response.data.data;
  
      const studentMap = new Map();
      grades.forEach((grade: { studentName: string; account: string; score: number | null; examName: string; studentClassId: number }) => {
        if (!studentMap.has(grade.account)) {
          studentMap.set(grade.account, {
            fullName: grade.studentName,
            account: grade.account,
            studentClassId: grade.studentClassId,
            scores: {},
          });
        }
        studentMap.get(grade.account).scores[grade.examName] = { score: grade.score };
      });
  
      const students = Array.from(studentMap.values());
  
      setStudents(students);
      setPagination({
        current: response.data.pageResponse.currentPage,
        pageSize: response.data.pageResponse.pageSize,
        total: response.data.pageResponse.totalElements || 0,
      });
    } catch (error) {
      console.error("Failed to fetch class grades:", error);
      message.error("Failed to fetch class grades");
    } finally {
      setLoading(false);
    }
  }, [classId]);  

  const fetchGradeTemplate = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get<{ data: GradeTemplate[] }>(
        `https://sep490-backend-production.up.railway.app/api/v1/grade-template/list?page=1&size=10`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setGradeTemplate(response.data.data[0]);
    } catch (error) {
      console.error("Failed to fetch grade template:", error);
      message.error("Failed to fetch grade template");
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && role === "CATECHIST" && classId) {
      fetchClassGrades(1, 10);
      fetchGradeTemplate();
    }
  }, [isLoggedIn, role, classId, fetchClassGrades, fetchGradeTemplate]);

  const toggleEditing = () => {
    if (isEditing) {
      fetchClassGrades(pagination.current, pagination.pageSize);
    }
    setIsEditing(!isEditing);
  };

  const saveGrades = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
  
      const studentClassScores = students.map((student) => ({
        studentClassId: student.studentClassId,
        exams: Object.entries(student.scores).map(([, scoreObj]) => ({
          examId: scoreObj.examId,
          score: scoreObj.score ?? 0
        }))
      }));
  
      await axios.put(
        "https://sep490-backend-production.up.railway.app/api/v1/student-grade",
        { studentClassScores },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
  
      message.success("Changes saved successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save grades:", error);
      message.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };  

  const handleScoreChange = useCallback((studentId: number, examName: string, value: string) => {
    setStudents(prevStudents => prevStudents.map(student => 
      student.studentClassId === studentId 
        ? {
            ...student,
            scores: {
              ...student.scores,
              [examName]: { 
                examId: student.scores[examName]?.examId || 0, // Preserve or set a default examId
                score: value === '' ? undefined : parseFloat(value)
              }
            }
          }
        : student
    ));
  }, []);
    

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

  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchClassGrades(page, pageSize || pagination.pageSize);
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
  }> = React.memo(({ value, onChange }) => (
    <Input
      value={value !== null && value !== undefined ? value.toString() : ''}
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
      render: (scoreObj: { score: number | undefined } | undefined, record: Student) =>
        isEditing ? (
          <EditableCell
            key={`${record.studentClassId}-${exam.name}`}
            value={scoreObj?.score}
            onChange={(value) => handleScoreChange(record.studentClassId, exam.name, value)}
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

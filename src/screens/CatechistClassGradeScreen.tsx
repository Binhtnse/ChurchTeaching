import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Spin,
  message,
  Button,
  Input,
  Pagination,
  Modal,
  Form as AntForm,
} from "antd";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import CloudinaryUploadWidget from "../components/CloudinaryUploadWidget";

interface ScoreData {
  examId: number;
  score: number | undefined;
  isChanged?: boolean;
}

interface RequestData {
  id: number;
  nameCreator: string;
  className: string;
  classId: number;
  reason: string;
  link: string;
  status: string;
}

interface Student {
  studentId: number;
  studentClassId: number;
  fullName: string;
  account: string;
  status: string;
  scores: {
    [key: string]: ScoreData;
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
  const [gradeTemplateId, setGradeTemplateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [allCellsFilled, setAllCellsFilled] = useState(false);
  const [isGradeFinalized, setIsGradeFinalized] = useState(false);
  const [canShowFinalizeButton, setCanShowFinalizeButton] = useState(false);
  const [userRequests, setUserRequests] = useState<RequestData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isReFinalizeModalVisible, setIsReFinalizeModalVisible] =
    useState(false);
  const [reFinalizeForm] = AntForm.useForm();
  const [isReopenStatus, setIsReopenStatus] = useState(false);

  const location = useLocation();
  const { academicYearId, gradeId } = location.state || {};

  const fetchSyllabus = useCallback(async () => {
    console.log("Fetching syllabus with:", { gradeId, academicYearId });
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/syllabus?status=ACTIVE&page=1&size=10&gradeId=${gradeId}&yearId=${academicYearId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success" && response.data.data.length > 0) {
        const templateId = response.data.data[0].syllabus.gradeTemplate.id;
        console.log("Got template ID:", templateId);
        setGradeTemplateId(templateId);
      }
    } catch (error) {
      console.error("Failed to fetch syllabus:", error);
    }
  }, [academicYearId, gradeId]);

  const checkUserReopenRequests = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;

      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/get-reopen-request",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        const userRequest = response.data.data.find(
          (request: RequestData) =>
            request.nameCreator === user.account &&
            request.classId === Number(classId) &&
            request.status !== "REJECT"
        );
        setUserRequests(userRequest ? [userRequest] : []);
      }
    } catch (error) {
      console.error("Error fetching reopen requests:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && role === "CATECHIST" && classId) {
      checkUserReopenRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, role, classId]);

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
          `https://sep490-backend-production.up.railway.app/api/v1/student-grade/class/${classId}?page=1&size=1000&academicYearId=${academicYearId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        ),
      ]);

      const students = studentsResponse.data.data.students;
      const grades = gradesResponse.data.data;

      setIsGradeFinalized(gradesResponse.data.status === "true");
      setIsReopenStatus(gradesResponse.data.status === "reopen");
      setCanShowFinalizeButton(gradesResponse.data.message === "true");

      const combinedStudents = students.map((student: Student) => {
        const scores = {};
        gradeTemplate?.exams.forEach((exam) => {
          const grade = grades.find(
            (g: Grade) =>
              g.account === student.account && g.examName === exam.name
          );
          (
            scores as Record<
              string,
              { examId: number; score: number | undefined }
            >
          )[exam.name] = {
            examId: exam.id,
            score: grade ? grade.score : undefined,
          };
        });
        return { ...student, scores };
      });

      setStudents(combinedStudents);
      setPagination((prev) => ({
        ...prev,
        current: 1,
        pageSize: combinedStudents.length,
        total: combinedStudents.length,
      }));
    } catch (error) {
      console.error("Failed to fetch class grades:", error);
      message.error("Lấy điểm lớp thất bại");
    } finally {
      setLoading(false);
    }
  }, [academicYearId, classId, gradeTemplate?.exams]);

  const saveReopenGrades = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
  
      // Modified to include all scores for all students
      const allScores = students.map((student) => ({
        studentClassId: student.studentClassId,
        exams: Object.entries(student.scores).map(([, score]) => ({
          examId: score.examId,
          score: score.score,
        })),
      }));
  
      await axios.put(
        `https://sep490-backend-production.up.railway.app/api/v1/student-grade-reopen/class/${classId}`,
        { studentClassScores: allScores },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      message.success("Thay đổi thành công");
      await Promise.all([
        fetchSyllabus(),
        fetchGradeTemplate(),
        fetchClassGrades(),
      ]);
  
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save reopen grades:", error);
      message.error("Lưu thay đổi thất bại");
    } finally {
      setLoading(false);
    }
  };  

  const handleReFinalize = async (values: { reason: string; link: string }) => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/class/re-finalize",
        {
          classId: Number(classId),
          reason: values.reason,
          link: values.link,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      message.success("Yêu cầu xem xét lại điểm thành công");
      setIsReFinalizeModalVisible(false);
      reFinalizeForm.resetFields();
      await Promise.all([
        fetchSyllabus(),
        fetchGradeTemplate(),
        fetchClassGrades(),
      ]);
    } catch (error) {
      console.error("Failed to submit re-finalize request:", error);
      message.error("Yêu cầu xem xét lại điểm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const fetchGradeTemplate = useCallback(async () => {
    if (!gradeTemplateId) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get<{ data: GradeTemplate }>(
        `https://sep490-backend-production.up.railway.app/api/v1/grade-template/${gradeTemplateId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setGradeTemplate(response.data.data);
      console.log("Grade template fetched:", response.data.data);
    } catch (error) {
      console.error("Failed to fetch grade template:", error);
      message.error("Failed to fetch grade template");
    }
  }, [gradeTemplateId]);

  useEffect(() => {
    if (isLoggedIn && role === "CATECHIST" && classId) {
      fetchSyllabus();
    }
  }, [isLoggedIn, role, classId, fetchSyllabus]);

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

      // Track only changed scores using Object.prototype.hasOwnProperty.call()
      const changedScores = students
        .filter((student) =>
          Object.values(student.scores).some(
            (score) =>
              Object.prototype.hasOwnProperty.call(score, "isChanged") &&
              score["isChanged"]
          )
        )
        .map((student) => ({
          studentClassId: student.studentClassId,
          exams: Object.entries(student.scores)
            .filter(
              ([, score]) =>
                Object.prototype.hasOwnProperty.call(score, "isChanged") &&
                score["isChanged"]
            )
            .map(([, score]) => ({
              examId: score.examId,
              score: score.score,
            })),
        }));

      if (changedScores.length > 0) {
        await axios.put(
          "https://sep490-backend-production.up.railway.app/api/v1/student-grade",
          { studentClassScores: changedScores },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        message.success("Thay đổi thành công");
        await Promise.all([
          fetchSyllabus(),
          fetchGradeTemplate(),
          fetchClassGrades(),
        ]);
      } else {
        message.info("Không có thay đổi để lưu");
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save grades:", error);
      message.error("Thay đổi thất bại");
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
                    isChanged: true, // Mark this score as changed
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
    const allFilledAndValid = students.every((student) =>
      gradeTemplate?.exams?.every((exam) => {
        const score = student.scores[exam.name]?.score;
        // Changed condition to allow 0 scores
        return score !== undefined && score !== null;
      })
    );
    setAllCellsFilled(allFilledAndValid);
  }, [students, gradeTemplate]);
  

  useEffect(() => {
    checkAllCellsFilled();
  }, [students, checkAllCellsFilled]);

  const handlePaginationChange = () => {
    fetchClassGrades();
  };

  const handleFinalize = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.post(
        `https://sep490-backend-production.up.railway.app/api/v1/student-grade/finalize/class/${classId}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      message.success(response.data.message || "Tổng kết điểm thành công");
      await Promise.all([
        fetchSyllabus(),
        fetchGradeTemplate(),
        fetchClassGrades(),
      ]); // Refresh the data after finalizing
    } catch (error) {
      console.error("Failed to finalize grades:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Tổng kết điểm thất bại");
      }
    } finally {
      setLoading(false);
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
      onChange={(e) => {
        const numValue = parseFloat(e.target.value);
        // Allow empty string or valid numbers including 0
        if (e.target.value === "" || (!isNaN(numValue) && numValue >= 0 && numValue <= 10)) {
          onChange(e.target.value);
        }
      }}
      onBlur={(e) => {
        const numValue = parseFloat(e.target.value);
        if (!isNaN(numValue)) {
          const clampedValue = Math.min(Math.max(numValue, 0), 10);
          onChange(clampedValue.toString());
        }
      }}
      min={0}
      max={10}
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
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Danh sách điểm số
      </h1>
      <Spin spinning={loading} tip="Đang tải...">
        {isReopenStatus ? (
          <Button
            onClick={isEditing ? saveReopenGrades : toggleEditing}
            className="mb-4 mr-4 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isEditing ? "Lưu thay đổi" : "Ghi nhận điểm"}
          </Button>
        ) : (
          // Existing button logic
          !isGradeFinalized && (
            <Button
              onClick={isEditing ? saveGrades : toggleEditing}
              className="mb-4 mr-4 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={isGradeFinalized}
            >
              {isEditing ? "Lưu thay đổi" : "Ghi nhận điểm"}
            </Button>
          )
        )}
        {allCellsFilled &&
          canShowFinalizeButton &&
          !isGradeFinalized &&
          !isReopenStatus &&
          !isEditing && (
            <Button
              onClick={handleFinalize}
              className="mb-4 bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Tổng kết
            </Button>
          )}
        {isGradeFinalized &&
          !isEditing &&
          canShowFinalizeButton &&
          userRequests.length === 0 && (
            <Button
              onClick={() => setIsReFinalizeModalVisible(true)}
              className="mb-4 bg-yellow-600 text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Yêu cầu xem xét lại điểm
            </Button>
          )}

        <Modal
          title="Yêu cầu xem xét lại điểm"
          open={isReFinalizeModalVisible}
          onCancel={() => {
            setIsReFinalizeModalVisible(false);
            reFinalizeForm.resetFields();
          }}
          footer={null}
        >
          <AntForm
            form={reFinalizeForm}
            layout="vertical"
            onFinish={handleReFinalize}
          >
            <AntForm.Item
              name="reason"
              label="Lý do xem xét lại"
              rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
            >
              <Input.TextArea rows={4} />
            </AntForm.Item>

            <AntForm.Item
              name="link"
              label="Tài liệu đính kèm"
              rules={[{ required: true, message: "Vui lòng tải lên tài liệu" }]}
            >
              <CloudinaryUploadWidget
                onUploadSuccess={(info: unknown) => {
                  const uploadInfo = info as { secure_url: string };
                  reFinalizeForm.setFieldsValue({
                    link: uploadInfo.secure_url,
                  });
                }}
                onUploadFailure={(error) => {
                  console.error("Upload failed:", error);
                  message.error("Tải file lên thất bại");
                }}
              />
            </AntForm.Item>

            <AntForm.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi yêu cầu
              </Button>
            </AntForm.Item>
          </AntForm>
        </Modal>
        <Table
          columns={classGradeColumns}
          dataSource={students}
          rowKey="studentClassId"
          pagination={false}
          className="bg-white shadow-lg rounded-lg overflow-hidden"
        />
        <Pagination
          current={pagination.current}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onChange={handlePaginationChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `Tổng ${total} mục`}
          className="mt-6 text-right"
        />
      </Spin>
    </div>
  );
};
export default CatechistClassGradeScreen;

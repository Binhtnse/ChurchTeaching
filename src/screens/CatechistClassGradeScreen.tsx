import React, { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Table,
  Typography,
  Spin,
  message,
  Button,
  Input,
  Pagination,
} from "antd";
import {
  fetchClassGrades,
  fetchGradeTemplate,
  saveGrades,
  setIsEditing,
  updateStudentScore,
  checkAllCellsFilled,
} from "../redux/slices/classGradesSlice";
import { RootState, AppDispatch } from "../redux/store";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";

const { Title } = Typography;

const CatechistClassGradeScreen: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const {
    students,
    gradeTemplate,
    loading,
    isEditing,
    allCellsFilled,
    pagination,
  } = useSelector((state: RootState) => state.classGrades);
  const { isLoggedIn, role } = useAuthState();

  useEffect(() => {
    if (isLoggedIn && role === "CATECHIST" && classId) {
      dispatch(fetchClassGrades({ classId, page: 1, pageSize: 10 }));
      dispatch(fetchGradeTemplate());
    }
  }, [dispatch, isLoggedIn, role, classId]);

  const toggleEditing = () => {
    if (isEditing) {
      dispatch(
        fetchClassGrades({
          classId: classId!,
          page: pagination.current,
          pageSize: pagination.pageSize,
        })
      );
    }
    dispatch(setIsEditing(!isEditing));
  };

  const saveChanges = async () => {
    try {
      await dispatch(saveGrades()).unwrap();
      message.success("Changes saved successfully");
    } catch (error: unknown) {
      message.error("Failed to save changes");
      console.error(error);
    }
  };
  const handleScoreChange = useCallback(
    (studentId: number, examName: string, value: string) => {
      const newValue = value === "" ? null : parseFloat(value);
      dispatch(
        updateStudentScore({ studentId, examName, score: newValue as number })
      );
      dispatch(checkAllCellsFilled());
    },
    [dispatch]
  );
  const handlePaginationChange = (page: number, pageSize?: number) => {
    dispatch(
      fetchClassGrades({
        classId: classId!,
        page,
        pageSize: pageSize || pagination.pageSize,
      })
    );
  };

  const handleFinalize = async () => {
    try {
      // Implement finalize logic here
      message.success("Grades finalized successfully");
    } catch (error) {
      message.error("Failed to finalize grades");
      console.log(error);
    }
  };

  const EditableCell = React.memo(
    ({
      value,
      onChange,
      studentId,
      examName,
    }: {
      value: number | undefined;
      onChange: (studentId: number, examName: string, value: string) => void;
      studentId: number;
      examName: string;
    }) => {
      const [inputValue, setInputValue] = useState(
        value !== undefined ? value.toString() : ""
      );

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(studentId, examName, newValue);
      };

      return <Input value={inputValue} onChange={handleChange} />;
    }
  );

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
      render: (score: number | undefined, record: { studentClassId: number }) =>
        isEditing ? (
          <EditableCell
            key={`${record.studentClassId}-${exam.name}`}
            value={score}
            onChange={handleScoreChange}
            studentId={record.studentClassId}
            examName={exam.name}
          />
        ) : (
          score ?? "-"
        ),
    })) || []),
    {
      title: "Tổng điểm",
      key: "totalScore",
      render: (record: { scores?: Record<string, number> }) => {
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

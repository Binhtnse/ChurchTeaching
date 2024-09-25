import React, { useState, useEffect, useCallback } from "react";
import { DatePicker, Table, Typography, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAuthState } from "../hooks/useAuthState";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

interface GradeData {
  key: string;
  category: string;
  component: string;
  weight: string;
  score: number | string;
}

const columns: ColumnsType<GradeData> = [
  {
    title: "Hạng mục",
    dataIndex: "category",
    key: "category",
    onHeaderCell: () => ({
      style: { backgroundColor: "#40a9ff" },
    }),
  },
  {
    title: "Thành phần điểm",
    dataIndex: "component",
    key: "component",
    onHeaderCell: () => ({
        style: { backgroundColor: "#40a9ff" },
      }),
  },
  {
    title: "Tỉ trọng",
    dataIndex: "weight",
    key: "weight",
    onHeaderCell: () => ({
        style: { backgroundColor: "#40a9ff" },
      }),
  },
  {
    title: "Điểm",
    dataIndex: "score",
    key: "score",
    onHeaderCell: () => ({
        style: { backgroundColor: "#40a9ff" },
      }),
  },
];

const StudyGradesScreen: React.FC = () => {
  const { isLoggedIn, userName, role } = useAuthState();
  const [averageScore, setAverageScore] = useState(0);
  const [data, setData] = useState<GradeData[]>([]);

  const fetchGradesData = useCallback(async () => {
    // Implement API call to fetch grades data
    // For now, we'll use mock data
    const mockData: GradeData[] = [
      {
        key: "1",
        category: "Kiểm tra 15 phút",
        component: "Lần 1",
        weight: "10%",
        score: 8,
      },
      {
        key: "2",
        category: "Kiểm tra 15 phút",
        component: "Lần 2",
        weight: "10%",
        score: 7,
      },
      {
        key: "3",
        category: "Kiểm tra 45 phút",
        component: "",
        weight: "20%",
        score: 7.5,
      },
      {
        key: "4",
        category: "Thi giữa kỳ",
        component: "",
        weight: "20%",
        score: 8,
      },
      {
        key: "5",
        category: "Thi cuối kỳ",
        component: "",
        weight: "40%",
        score: 8.5,
      },
    ];
    setData(mockData);
    calculateAverageScore(mockData);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchGradesData();
    }
  }, [isLoggedIn, fetchGradesData]);

  if (!isLoggedIn || (role !== "PARENT" && role !== "STUDENT")) {
    return <div>You do not have permission to view this page.</div>;
  }

  const calculateAverageScore = (grades: GradeData[]) => {
    const total = grades.reduce(
      (sum, grade) => sum + (typeof grade.score === "number" ? grade.score : 0),
      0
    );
    setAverageScore(total / grades.length);
  };

  if (!isLoggedIn) {
    return <div>Please log in to view your grades.</div>;
  }

  const passingStatus = averageScore >= 5 ? "Đạt" : "Không đạt";

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        Bảng điểm ChurchTeaching cho {userName}
      </Title>

      <Space direction="vertical" className="mb-6">
        <Text strong>Chọn khoảng thời gian:</Text>
        <RangePicker style={{ width: "300px" }} />
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        className="mb-6"
      />

      <div className="space-y-2">
        <Text strong>Điểm trung bình: {averageScore.toFixed(2)}</Text>
        <br />
        <Text strong>
          Trạng thái:{" "}
          <span
            className={
              passingStatus === "Đạt" ? "text-green-500" : "text-red-500"
            }
          >
            {passingStatus}
          </span>
        </Text>
      </div>
    </div>
  );
};
export default StudyGradesScreen;

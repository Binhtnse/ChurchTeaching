import React, { useEffect, useState, useCallback } from "react";
import { Table, Card, Tag, Spin } from "antd";
import axios from "axios";
import { ColumnsType } from "antd/es/table";

interface Exam {
  id: number;
  name: string;
  weight: number;
  orderExam: number | null;
  status: string | null;
  gradeTemplateName: string;
  isFullSlot: string;
}

interface GradeTemplate {
  id: number;
  name: string;
  maxExamCount: number;
  exams: Exam[];
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
    totalElements: number | null;
  };
  data: GradeTemplate[];
}

const AdminGradeTemplateListScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [gradeTemplates, setGradeTemplates] = useState<GradeTemplate[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchGradeTemplates = useCallback(
    async (page: number = 1, size: number = 10) => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get<ApiResponse>(
          `https://sep490-backend-production.up.railway.app/api/v1/grade-template/list?page=${page}&size=${size}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setGradeTemplates(response.data.data);
        setPagination({
          ...pagination,
          current: response.data.pageResponse.currentPage,
          total: response.data.pageResponse.totalElements || 0,
        });
      } catch (error) {
        console.error("Error fetching grade templates:", error);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    fetchGradeTemplates();
  }, [fetchGradeTemplates]);

  const expandedRowRender = (record: GradeTemplate) => {
    const columns: ColumnsType<Exam> = [
      {
        title: "Tên bài kiểm tra",
        dataIndex: "name",
        key: "name",
        className: "font-medium",
      },
      {
        title: "Tỉ trọng",
        dataIndex: "weight",
        key: "weight",
        render: (weight: number) => (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
            {`${weight * 100}%`}
          </span>
        ),
        className: "text-center",
        align: "center",
        onHeaderCell: () => ({
          style: { textAlign: "center" },
        }),
      },
      {
        title: "Thời lượng",
        dataIndex: "isFullSlot",
        key: "isFullSlot",
        render: (isFullSlot: string) => (
          <Tag
            color={isFullSlot === "true" ? "green" : "blue"}
            className="px-3 py-1 rounded-full"
          >
            {isFullSlot === "true" ? "Một buổi" : "Nửa buổi"}
          </Tag>
        ),
        className: "text-center",
        align: "center",
        onHeaderCell: () => ({
          style: { textAlign: "center" },
        }),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={record.exams}
        pagination={false}
        rowKey="id"
        className="bg-gray-50 rounded-lg mt-2"
        rowClassName="hover:bg-white transition-colors duration-200"
      />
    );
  };

  const columns: ColumnsType<GradeTemplate> = [
    {
      title: "Tên khung kiểm tra",
      dataIndex: "name",
      key: "name",
      className: "text-center",
      align: "center",
      onHeaderCell: () => ({
        style: { textAlign: "center" as const },
      }),
    },
    {
      title: "Số bài kiểm tra",
      dataIndex: "maxExamCount",
      key: "maxExamCount",
      className: "text-center",
      align: "center",
      onHeaderCell: () => ({
        style: { textAlign: "center" as const },
      }),
    },
    {
      title: "Các bài kiểm tra",
      key: "currentExams",
      dataIndex: "exams",
      className: "text-center",
      align: "center",
      render: (_, record: GradeTemplate) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
          {`${record.exams.length}`}
        </span>
      ),
      onHeaderCell: () => ({
        style: { textAlign: "center" as const },
      }),
    },
];

  return (
    <div className="p-8 bg-white rounded-lg min-h-screen">
      <Card className="shadow-lg rounded-lg" bodyStyle={{ padding: "24px" }}>
        <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
          Danh sách các khung kiểm tra
        </h1>
        <Spin spinning={loading}>
          <Table
            className="w-full"
            columns={columns}
            expandable={{
              expandedRowRender,
              rowExpandable: (record) => record.exams?.length > 0,
              expandIcon: ({ expanded, onExpand, record }) => (
                <button
                  onClick={(e) => onExpand(record, e)}
                  className={`transition-all duration-200 ${
                    expanded ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {expanded ? "▼" : "▶"}
                </button>
              ),
            }}
            dataSource={gradeTemplates}
            rowKey="id"
            pagination={{
              ...pagination,
              className: "mt-4",
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} mục`,
              style: { marginTop: "20px" },
            }}
            onChange={(pagination) => {
              fetchGradeTemplates(pagination.current, pagination.pageSize);
            }}
            rowClassName="hover:bg-blue-50 transition-colors duration-200"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
            }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default AdminGradeTemplateListScreen;

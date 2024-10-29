import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Spin,
  Typography,
  TablePaginationConfig,
  message,
  Select,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

interface ClassData {
  id: number;
  name: string;
  numberOfCatechist: number | null;
  gradeName: string;
  academicYear: string;
  status: string;
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
  data: ClassData[];
}

const CatechistClassList: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string }[]
  >([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=10",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "success") {
        setGrades(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      message.error("An error occurred while fetching grades");
    }
  };

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
  }, []);

  const fetchClasses = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (!selectedYear) return;
      try {
        setLoading(true);
        const userString = localStorage.getItem("userLogin");
        const user = userString ? JSON.parse(userString) : null;
        const userId = user ? user.id : null;

        if (!userId) {
          console.error("User ID not found");
          return;
        }
        const accessToken = localStorage.getItem("accessToken");
        const gradeParam = selectedGrade ? `&gradeId=${selectedGrade}` : "";
        const response = await axios.get<ApiResponse>(
          `https://sep490-backend-production.up.railway.app/api/v1/class/catechist/${userId}?page=${page}&size=${pageSize}&academicYearId=${selectedYear}${gradeParam}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setClasses(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pageResponse.totalPage * pageSize,
          current: page,
          pageSize: pageSize,
        }));
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedYear, selectedGrade]
  );

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
    fetchClasses(1, pagination.pageSize);
  };

  const handleGradeChange = (value: number) => {
    setSelectedGrade(value);
    fetchClasses(1, pagination.pageSize);
  };

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleRowClick = (record: ClassData) => {
    navigate(`/classes-catechist/${record.id}`);
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    }));
  };

  const columns = [
    {
      title: <span className="text-blue-600 font-semibold">Tên lớp</span>,
      dataIndex: "name",
      key: "name",
    },
    {
      title: <span className="text-blue-600 font-semibold">Khối</span>,
      dataIndex: "gradeName",
      key: "gradeName",
    },
    {
      title: <span className="text-blue-600 font-semibold">Niên Khóa</span>,
      dataIndex: "academicYear",
      key: "academicYear",
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen">
      <Title level={2} className="mb-6 text-blue-600 text-center font-bold">
        Lớp của giáo lý viên
      </Title>
      <Select
        style={{ width: 200 }}
        placeholder="Chọn niên khóa"
        onChange={handleYearChange}
        value={selectedYear}
        className="border border-blue-300 rounded-md shadow-sm"
      >
        {academicYears.map((year) => (
          <Select.Option key={year.id} value={year.id}>
            {year.year}
          </Select.Option>
        ))}
      </Select>
      <Select
        style={{ width: 200, marginBottom: 16, marginLeft: 16 }}
        placeholder="Chọn khối"
        onChange={handleGradeChange}
        value={selectedGrade}
        className="border border-blue-300 rounded-md shadow-sm"
      >
        {grades.map((grade) => (
          <Select.Option key={grade.id} value={grade.id}>
            {grade.name}
          </Select.Option>
        ))}
      </Select>
      <Spin spinning={loading}>
        {selectedYear ? (
          <Table
            columns={columns}
            dataSource={classes}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            className="bg-white rounded-lg shadow-md overflow-hidden"
            rowClassName={() =>
              "hover:bg-gray-50 transition-colors duration-200"
            }
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: "pointer" },
            })}
          />
        ) : (
          <Typography.Text>Vui lòng chọn niên khóa.</Typography.Text>
        )}
      </Spin>
    </div>
  );
};
export default CatechistClassList;

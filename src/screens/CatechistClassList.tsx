import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Spin,
  TablePaginationConfig,
  message,
  Select,
  Tag,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    { id: number; year: string; timeStatus: string }[]
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
        if (!response.data.data || response.data.data.length === 0) {
          setClasses([]);
          setPagination((prev) => ({
            ...prev,
            total: 0,
            current: 1
          }));
          message.info("Không tìm thấy lớp học nào");
          return;
        }
        setClasses(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pageResponse.totalPage * pageSize,
          current: page,
          pageSize: pageSize,
        }));
      } catch (error) {
        console.error("Error fetching classes:", error);
        message.error("Không thể tải danh sách lớp học");
        setClasses([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          current: 1
        }));
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
    <div className="p-6 bg-white rounded-lg shadow-md">
    <h1 className="text-2xl font-bold text-blue-600">
      Lớp của giáo lý viên
    </h1>
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Select
        className="w-48"
        placeholder="Chọn niên khóa"
        onChange={handleYearChange}
        value={selectedYear}
      >
        {academicYears.map((year) => (
          <Select.Option key={year.id} value={year.id}>
            {year.year}{" "}
            {year.timeStatus === "NOW" && (
              <Tag color="blue" className="ml-2">
                Hiện tại
              </Tag>
            )}
          </Select.Option>
        ))}
      </Select>
      <Select
        className="w-48"
        placeholder="Chọn khối"
        onChange={handleGradeChange}
        value={selectedGrade}
      >
        {grades.map((grade) => (
          <Select.Option key={grade.id} value={grade.id}>
            {grade.name}
          </Select.Option>
        ))}
      </Select>
    </div>

    {selectedYear ? (
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={classes}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          className="mb-4 overflow-x-auto"
          rowClassName="hover:bg-gray-50"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: "pointer" },
          })}
        />
      </Spin>
    ) : (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg font-semibold">Vui lòng chọn niên khóa</p>
        <p className="text-sm">
          Chọn một niên khóa để xem danh sách lớp học
        </p>
      </div>
    )}
  </div>
  );
};
export default CatechistClassList;

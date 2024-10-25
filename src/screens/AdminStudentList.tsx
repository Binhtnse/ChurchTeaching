import React, { useState, useEffect, useCallback } from "react";
import { Table, Spin, Typography, TablePaginationConfig, message, Select } from "antd";
import axios from "axios";

const { Title } = Typography;

interface StudentData {
  id: number;
  fullName: string;
  holyName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
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
  data: StudentData[];
}

const AdminStudentList: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [academicYears, setAcademicYears] = useState<{ id: number; year: string }[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
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

  const fetchStudents = useCallback(async (page: number = 1, pageSize: number = 10) => {
    if (!selectedYear || !selectedGrade) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get<ApiResponse>(
        `https://sep490-backend-production.up.railway.app/api/student-grade-year/get-student-to-prepare-arrange-class?academicYearId=${selectedYear}&gradeId=${selectedGrade}&page=${page-1}&size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pageResponse.totalElements || 0,
        current: page,
        pageSize: pageSize,
      }));
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedGrade]);

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedGrade) {
      fetchStudents(pagination.current, pagination.pageSize);
    }
  }, [fetchStudents, selectedYear, selectedGrade, pagination]);

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleGradeChange = (value: number) => {
    setSelectedGrade(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchStudents(newPagination.current || 1, newPagination.pageSize || 10);
  };

  const columns = [
    {
      title: <span className="text-blue-600 font-semibold">Tên Thánh</span>,
      dataIndex: "holyName",
      key: "holyName",
    },
    {
      title: <span className="text-blue-600 font-semibold">Họ và Tên</span>,
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: <span className="text-blue-600 font-semibold">Ngày Sinh</span>,
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
    },
    {
      title: <span className="text-blue-600 font-semibold">Địa Chỉ</span>,
      dataIndex: "address",
      key: "address",
    },
    {
      title: <span className="text-blue-600 font-semibold">Số Điện Thoại</span>,
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen">
      <Title level={2} className="mb-6 text-blue-600 text-center font-bold">
        Danh Sách Thiếu Nhi
      </Title>
      
      <div className="mb-6 flex gap-4">
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
          style={{ width: 200 }}
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
      </div>

      <Spin spinning={loading}>
        {selectedYear && selectedGrade ? (
          <Table
            columns={columns}
            dataSource={students}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            className="bg-white rounded-lg shadow-md overflow-hidden"
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
          />
        ) : (
          <Typography.Text>Vui lòng chọn niên khóa và khối.</Typography.Text>
        )}
      </Spin>
    </div>
  );
};

export default AdminStudentList;

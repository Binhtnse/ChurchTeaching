import React, { useState, useEffect, useCallback } from "react";
import { Table, Spin, TablePaginationConfig, message, Select, Tag } from "antd";
import axios from "axios";

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
  message: string;
  timestamp: string;
  data: {
    content: Array<{
      student: {
        id: number;
        fullName: string;
        saintName: string;
        dob: string;
        address: string | null;
        phoneNumber: string | null;
      };
      studyStatus: string;
    }>;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

const AdminStudentList: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
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

  const fetchStudents = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (!selectedYear || !selectedGrade) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const response = await axios.get<ApiResponse>(
          `https://sep490-backend-production.up.railway.app/api/student-grade-year/get-student-to-prepare-arrange-class?academicYearId=${selectedYear}&gradeId=${selectedGrade}&page=${
            page - 1
          }&size=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Transform the data to match the expected structure
        const transformedStudents = response.data.data.content.map((item) => ({
          id: item.student.id,
          fullName: item.student.fullName,
          holyName: item.student.saintName,
          dateOfBirth: item.student.dob,
          address: item.student.address || "N/A",
          phoneNumber: item.student.phoneNumber || "N/A",
          status: item.studyStatus,
        }));

        setStudents(transformedStudents);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.totalElements,
          current: page,
          pageSize: pageSize,
        }));
      } catch (error) {
        console.error("Error fetching students:", error);
        message.error("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    },
    [selectedYear, selectedGrade]
  );

  const handleAutoAssignStudents = async () => {
    if (!selectedYear || !selectedGrade) {
      message.warning("Vui lòng chọn niên khóa và khối");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `https://sep490-backend-production.up.railway.app/api/student-grade-year/auto-assign-student-to-class?academicYearId=${selectedYear}&gradeId=${selectedGrade}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Xếp lớp thành công");
      fetchStudents(pagination.current, pagination.pageSize);
    } catch (error) {
      console.log(error);
      message.error("Xếp lớp thất bại");
    }
  };

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedGrade) {
      fetchStudents(pagination.current, pagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStudents, selectedYear, selectedGrade]);

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleGradeChange = (value: number) => {
    setSelectedGrade(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
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
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600">Danh Sách Thiếu Nhi</h1>

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

        <button
          onClick={handleAutoAssignStudents}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Xếp thiếu nhi vào lớp
        </button>
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
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg font-semibold">
              Vui lòng chọn niên khóa và khối
            </p>
            <p className="text-sm">
              Chọn một niên khóa và khối để xem danh sách thiếu nhi
            </p>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default AdminStudentList;

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Spin,
  TablePaginationConfig,
  message,
  Select,
  Tag,
  Card,
  Button,
} from "antd";
import axios from "axios";

interface CertificateData {
  certificateId: number;
  studentName: string;
  className: string;
  gradeName: string;
  academicYear: string;
  finalResult: string;
  gpa: string;
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
  data: CertificateData[];
}

const StudentCertificateListScreen: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
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

  const userString = localStorage.getItem("userLogin");
  const studentId = userString ? JSON.parse(userString).id : null;
  const token = localStorage.getItem("accessToken");

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      setAcademicYears(response.data);
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch academic years");
    }
  };

  const fetchGrades = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=30",
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
      console.log(error);
      message.error("An error occurred while fetching grades");
    }
  }, [token]);

  const fetchCertificates = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (!selectedYear || !selectedGrade) {
        setCertificates([]);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse>(
          `https://sep490-backend-production.up.railway.app/api/v1/certificate/user/${studentId}?page=${page}&size=${pageSize}&gradeId=${selectedGrade}&academicYearId=${selectedYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.data.status === "SUCCESS") {
          setCertificates(response.data.data);
          setPagination((prev) => ({
            ...prev,
            total: response.data.pageResponse.totalPage * pageSize,
            current: page,
          }));
        } else {
          // Clear certificates if response status is not SUCCESS
          setCertificates([]);
        }
      } catch (error) {
        console.log(error);
        message.error("Cannot load certificates list");
        // Clear certificates on error
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedYear, selectedGrade, studentId, token]
  );

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
  }, [fetchGrades]);

  useEffect(() => {
    setCertificates([]);
  }, [selectedYear, selectedGrade]);

  useEffect(() => {
    if (selectedYear && selectedGrade) {
      fetchCertificates();
    }
  }, [fetchCertificates, selectedYear, selectedGrade]);

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
  };

  const handleGradeChange = (value: number) => {
    setSelectedGrade(value);
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchCertificates(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: <span className="text-blue-600 font-semibold">Tên thiếu nhi</span>,
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: <span className="text-blue-600 font-semibold">Lớp</span>,
      dataIndex: "className",
      key: "className",
    },
    {
      title: <span className="text-blue-600 font-semibold">Khối</span>,
      dataIndex: "gradeName",
      key: "gradeName",
    },
    {
      title: <span className="text-blue-600 font-semibold">Niên khóa</span>,
      dataIndex: "academicYear",
      key: "academicYear",
    },
    {
      title: <span className="text-blue-600 font-semibold">Điểm Tổng Kết</span>,
      dataIndex: "gpa",
      key: "gpa",
    },
    {
      title: <span className="text-blue-600 font-semibold">Kết quả</span>,
      dataIndex: "finalResult",
      key: "finalResult",
      render: (result: string) => (
        <Tag color={result === "PASS" ? "green" : "red"}>
          {result === "PASS" ? "Đạt" : "Không đạt"}
        </Tag>
      ),
    },
    {
      title: <span className="text-blue-600 font-semibold">Thao tác</span>,
      key: "actions",
      render: (record: CertificateData) => (
        <Button
          type="primary"
          onClick={() => {
            window.open(
              `https://sep490-backend-production.up.railway.app/api/v1/certificate/${record.certificateId}/pdf`,
              "_blank"
            );
          }}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Xem chứng chỉ
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Danh sách chứng chỉ
      </h1>

      <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Niên khóa
            </label>
            <Select
              className="w-full"
              placeholder="Chọn niên khóa"
              onChange={handleYearChange}
              value={selectedYear}
            >
              {academicYears.map((year) => (
                <Select.Option key={year.id} value={year.id}>
                  {year.year}
                  {year.timeStatus === "NOW" && (
                    <Tag color="blue" className="ml-2">
                      Hiện tại
                    </Tag>
                  )}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Khối</label>
            <Select
              className="w-full"
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
        </div>
      </Card>

      {selectedYear && selectedGrade ? (
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={certificates}
            rowKey="certificateId"
            pagination={pagination}
            onChange={handleTableChange}
            className="mb-4 overflow-x-auto"
            rowClassName="hover:bg-gray-50"
          />
        </Spin>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-semibold">
            Vui lòng chọn đầy đủ thông tin
          </p>
          <p className="text-sm">
            Chọn niên khóa và khối để xem danh sách chứng chỉ
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentCertificateListScreen;

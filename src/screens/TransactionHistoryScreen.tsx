import React, { useState, useEffect, useCallback } from "react";
import { Table, Select, Tag, Card } from "antd";
import axios from "axios";

const { Option } = Select;

interface Transaction {
  tuitionId: number;
  className: string;
  grade: string;
  amount: number;
  donate: number | null;
  status: string;
  transactionDate: string;
  academicYear: string;
  student: {
    id: number;
    fullNameStudent: string;
    className: string;
    role: string;
  };
  payer: {
    id: number;
    fullNamePayer: string;
    role: string;
  };
}

interface Class {
  id: number;
  name: string;
  gradeName: string;
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
  data: Transaction[];
}

const TransactionHistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    number | null
  >(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      setAcademicYears(response.data);
    } catch (error) {
      console.error("Error fetching academic years:", error);
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
    }
  };

  const fetchClasses = useCallback(async () => {
    if (!selectedAcademicYear || !selectedGrade) return;
    try {
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/list?page=1&size=100&academicYearId=${selectedAcademicYear}&gradeId=${selectedGrade}`
      );
      if (!response.data.data || response.data.data.length === 0) {
        setClasses([]);
        return;
      }
      setClasses(response.data.data);
    } catch (error) {
      console.log(error);
      setClasses([]);
    }
  }, [selectedAcademicYear, selectedGrade]);

  useEffect(() => {
    if (selectedAcademicYear && selectedGrade) {
      fetchClasses();
    }
  }, [selectedAcademicYear, selectedGrade, fetchClasses]);

  const fetchTransactions = useCallback(async () => {
    if (!selectedAcademicYear) return;

    try {
      setLoading(true);
      const gradeParam = selectedGrade ? `&gradeId=${selectedGrade}` : "";
      const classParam = selectedClass ? `&classId=${selectedClass}` : "";
      const response = await axios.get<ApiResponse>(
        `https://sep490-backend-production.up.railway.app/api/v1/tuition/admin/transactions?page=1&size=10&academicYearId=${selectedAcademicYear}${gradeParam}${classParam}`
      );
      setTransactions(response.data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedAcademicYear, selectedGrade, selectedClass]);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchTransactions();
    }
  }, [fetchTransactions, selectedAcademicYear, selectedGrade]);

  const handleAcademicYearChange = (value: number) => {
    setSelectedAcademicYear(value);
  };

  const handleGradeChange = (value: number) => {
    setSelectedGrade(value);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "tuitionId",
      key: "tuitionId",
    },
    {
      title: "Tên lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Tổng thanh toán",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `${amount.toLocaleString()} VNĐ`,
    },
    {
      title: "Đóng góp thêm",
      dataIndex: "donate",
      key: "donate",
      render: (donate: number | null) =>
        donate ? `${donate.toLocaleString()} VNĐ` : "-",
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "transactionDate",
      key: "transactionDate",
    },
    {
      title: "Niên khóa",
      dataIndex: "academicYear",
      key: "academicYear",
    },
    {
      title: "Thiếu nhi",
      dataIndex: "student",
      key: "student",
      render: (student: Transaction["student"]) => student.fullNameStudent,
    },
    {
      title: "Người thanh toán",
      dataIndex: "payer",
      key: "payer",
      render: (payer: Transaction["payer"]) => payer.fullNamePayer,
    },
  ].map((column) => ({
    ...column,
    className: "px-4 py-2",
    headerClassName: "bg-blue-500 text-white font-bold",
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
          Lịch sử giao dịch
        </h1>
        <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Niên khóa
              </label>
              <Select
                className="w-full"
                placeholder="Chọn niên khóa"
                onChange={handleAcademicYearChange}
              >
                {academicYears.map((year) => (
                  <Option key={year.id} value={year.id}>
                    {year.year}{" "}
                    {year.timeStatus === "NOW" && (
                      <Tag color="blue" className="ml-2">
                        Hiện tại
                      </Tag>
                    )}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Khối</label>
              <Select
                className="w-full"
                placeholder="Chọn khối"
                onChange={handleGradeChange}
                allowClear
              >
                {grades.map((grade) => (
                  <Option key={grade.id} value={grade.id}>
                    {grade.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Lớp</label>
              <Select
                className="w-full"
                placeholder="Chọn lớp"
                onChange={(value) => setSelectedClass(value)}
                value={selectedClass}
                disabled={!selectedAcademicYear || !selectedGrade}
                allowClear
              >
                {classes.map((cls) => (
                  <Option key={cls.id} value={cls.id}>
                    {cls.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>
        {selectedAcademicYear ? (
          <Table
            dataSource={transactions}
            columns={columns}
            rowKey="tuitionId"
            className="shadow-lg bg-white rounded-lg overflow-hidden"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              className: "bg-gray-50 p-4",
            }}
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
            loading={loading}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg font-semibold">Vui lòng chọn niên khóa</p>
            <p className="text-sm">
              Chọn một niên khóa để xem lịch sử giao dịch
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryScreen;

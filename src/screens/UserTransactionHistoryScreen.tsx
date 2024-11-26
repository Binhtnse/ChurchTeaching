import React, { useState, useEffect, useCallback } from "react";
import { Table, Spin, message, Select, Tag, Card } from "antd";
import axios from "axios";

interface Transaction {
  tuitionId: number;
  className: string;
  grade: string;
  amount: number;
  donate: number;
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

const UserTransactionHistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
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
      console.error("Error fetching grades:", error);
      message.error("An error occurred while fetching grades");
    }
  };

  const fetchClasses = useCallback(async () => {
    if (!selectedYear || !selectedGrade) return;
    try {
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/list?page=1&size=100&academicYearId=${selectedYear}&gradeId=${selectedGrade}`
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
  }, [selectedYear, selectedGrade]);

  useEffect(() => {
    if (selectedYear && selectedGrade) {
      fetchClasses();
    }
  }, [selectedYear, selectedGrade, fetchClasses]);

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
  }, []);

  const fetchTransactions = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      console.log('Selected Year ID:', selectedYear);
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
        let url = `https://sep490-backend-production.up.railway.app/api/v1/tuition/transactions/${userId}?page=${page}&size=${pageSize}`;

        if (selectedYear) {
          url += `&academicYearId=${selectedYear}`;
        }
        if (selectedGrade) {
          url += `&gradeId=${selectedGrade}`;
        }
        if (selectedClass) {
          url += `&classId=${selectedClass}`;
        }

        const response = await axios.get<ApiResponse>(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Handle empty or null response data
        if (response.data && response.data.data) {
          setTransactions(response.data.data);
        } else {
          setTransactions([]); // Set empty array if no data
        }

        // Handle pagination even when no data
        if (response.data && response.data.pageResponse) {
          setPagination((prev) => ({
            ...prev,
            total: (response.data.pageResponse.totalPage || 1) * pageSize,
            current: page,
            pageSize: pageSize,
          }));
        } else {
          setPagination((prev) => ({
            ...prev,
            total: 0,
            current: 1,
            pageSize: pageSize,
          }));
        }

        // Add a message when no data is found
        if (!response.data?.data?.length) {
          message.info('Không tìm thấy dữ liệu phù hợp với bộ lọc');
        }

      } catch (error) {
        console.error("Error fetching transactions:", error);
        message.error("Failed to fetch transaction history");
        setTransactions([]); // Clear transactions on error
        setPagination((prev) => ({
          ...prev,
          total: 0,
          current: 1,
        }));
      } finally {
        setLoading(false);
      }
    },
    [selectedYear, selectedGrade, selectedClass]
  );


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const amount = urlParams.get("amount");
    const payerId = urlParams.get("payerId");
    const studentClassId = urlParams.get("studentClassId");

    if (status === "PAID" && amount && payerId && studentClassId) {
      const transactionId = urlParams.get("id"); // Get unique transaction ID
      const hasProcessed = sessionStorage.getItem(`payment_${transactionId}`);

      if (!hasProcessed) {
        const notifyPaymentSuccess = async () => {
          try {
            await axios.post(
              `https://sep490-backend-production.up.railway.app/api/v1/tuition/payment-success?amount=${amount}&payerId=${payerId}&studentClassId=${studentClassId}`
            );
            sessionStorage.setItem(`payment_${transactionId}`, "true");
            // Clear URL parameters after successful processing
            window.history.replaceState({}, "", "/transaction-history-user");
          } catch (error) {
            console.error("Error notifying payment success:", error);
          }
        };

        notifyPaymentSuccess();
      }
    }

    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      if (mounted && selectedYear) {
        await fetchTransactions(1, pagination.pageSize);
      }
    };
    
    fetchData();
    
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const columns = [
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Khối",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Tổng thanh toán",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `${amount.toLocaleString()} VND`,
    },
    {
      title: "Đóng góp thêm",
      dataIndex: "donate",
      key: "donate",
      render: (donate: number) => `${donate.toLocaleString()} VND`,
    },
    {
      title: "Ngày giao dịch",
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
      dataIndex: ["student", "fullNameStudent"],
      key: "student",
    },
    {
      title: "Người thanh toán",
      dataIndex: ["payer", "fullNamePayer"],
      key: "payer",
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
                onChange={(value) => {
                  setSelectedYear(value);
                }}
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Khối</label>
              <Select
                className="w-full"
                placeholder="Chọn khối"
                onChange={(value) => {
                  setSelectedGrade(value);
                  fetchTransactions(1, pagination.pageSize);
                }}
                value={selectedGrade}
              >
                {grades.map((grade) => (
                  <Select.Option key={grade.id} value={grade.id}>
                    {grade.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Lớp</label>
              <Select
                className="w-full"
                placeholder="Chọn lớp"
                onChange={(value) => {
                  setSelectedClass(value);
                  fetchTransactions(1, pagination.pageSize);
                }}
                value={selectedClass}
                disabled={!selectedYear || !selectedGrade}
                allowClear
              >
                {classes.map((cls) => (
                  <Select.Option key={cls.id} value={cls.id}>
                    {cls.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>
        {selectedYear ? (
          <Spin spinning={loading} tip="Đang tải dữ liệu...">
            <Table
              columns={columns}
              dataSource={transactions}
              rowKey="tuitionId"
              pagination={pagination}
              onChange={(newPagination) =>
                fetchTransactions(newPagination.current, newPagination.pageSize)
              }
              className="bg-white rounded-lg shadow-lg"
              rowClassName="hover:bg-gray-50 transition-colors duration-200"
            />
          </Spin>
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

export default UserTransactionHistoryScreen;

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Spin,
  TablePaginationConfig,
  message,
  Select,
  Tag,
  Card,
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
  timeStatus: string;
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

  const fetchGrades = useCallback(async () => {
    try {
      const userString = localStorage.getItem("userLogin");
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.id;
      const token = localStorage.getItem("accessToken");
  
      if (!selectedYear) {
        setGrades([]);
        return;
      }
  
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/grade/catechist/${userId}?academicYearId=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.status === "success") {
        if (!response.data.data || response.data.data.length === 0) {
          setGrades([]);
          message.info("Không tìm thấy khối nào trong niên khóa này");
          return;
        }
        setGrades(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      message.error("Không thể tải danh sách khối");
      setGrades([]);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
  }, [fetchGrades]);

  const fetchClasses = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      // Clear data immediately when no year is selected
      if (!selectedYear) {
        setClasses([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          current: 1,
        }));
        return;
      }

      try {
        setLoading(true);
        const userString = localStorage.getItem("userLogin");
        const user = userString ? JSON.parse(userString) : null;
        const userId = user ? user.id : null;

        if (!userId) {
          setClasses([]); // Clear data if no user ID
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

        // Clear data immediately when response has no data
        if (!response.data.data || response.data.data.length === 0) {
          setClasses([]);
          setPagination((prev) => ({
            ...prev,
            total: 0,
            current: 1,
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
        console.log(error)
        setClasses([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          current: 1,
        }));
        message.error("Không thể tải danh sách lớp học");
      } finally {
        setLoading(false);
      }
    },
    [selectedYear, selectedGrade]
  );

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
    setSelectedGrade(null);
    setGrades([]); 
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
      title: <span className="text-blue-600 font-semibold text-base">Tên lớp</span>,
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="text-gray-700 font-medium">{text}</span>
      ),
    },
    {
      title: <span className="text-blue-600 font-semibold text-base">Khối</span>,
      dataIndex: "gradeName",
      key: "gradeName",
      render: (text: string) => (
        <span className="text-gray-700">{text}</span>
      ),
    },
    {
      title: <span className="text-blue-600 font-semibold text-base">Niên Khóa</span>,
      dataIndex: "academicYear",
      key: "academicYear",
      render: (text: string) => (
        <span className="text-gray-700">{text}</span>
      ),
    },
    {
      title: <span className="text-blue-600 font-semibold text-base">Trạng thái</span>,
      dataIndex: "timeStatus",
      key: "timeStatus",
      render: (timeStatus: string) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium
          ${timeStatus === 'not_done' ? 'bg-yellow-100 text-yellow-700' : 
            timeStatus === 'done' ? 'bg-green-100 text-green-700' : ''}`}>
          {timeStatus === 'not_done' ? 'Chưa hoàn thành' : 
           timeStatus === 'done' ? 'Đã hoàn thành' : ''}
        </span>
      ),
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Lớp của giáo lý viên
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

      {selectedYear ? (
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={classes}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            className="mb-4 overflow-x-auto shadow-sm rounded-lg"
            rowClassName={() => 
              "hover:bg-blue-50 transition-colors duration-200 text-base border-b"
            }
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: "pointer" },
              className: "hover:shadow-md transition-shadow duration-200"
            })}
          />
        </Spin>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-semibold">Vui lòng chọn niên khóa</p>
          <p className="text-sm">Chọn một niên khóa để xem danh sách lớp học</p>
        </div>
      )}
    </div>
  );
};
export default CatechistClassList;

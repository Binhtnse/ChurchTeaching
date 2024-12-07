import React, { useEffect, useState, useCallback } from "react";
import { Table, Tag, message, Select, Card } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { useNavigate } from "react-router-dom";

interface Syllabus {
  id: number;
  grade: {
    name: string;
    age: number;
  };
  syllabus: {
    id: number;
    name: string;
    duration: string;
  };
  academicYear: {
    id: number;
    year: string;
  };
  isCurrent: string;
  status: string;
}

const ListSyllabusScreen: React.FC = () => {
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const { role, isLoggedIn } = useAuthState();
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isYearSelected, setIsYearSelected] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

  const fetchGrades = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=30",
      );
      if (response.data.status === "success") {
        setGrades(response.data.data);
      } else {
        message.error("Failed to fetch grades");
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

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

  useEffect(() => {
    if (isLoggedIn && role === "ADMIN") {
      fetchGrades();
      fetchAcademicYears();
    }
  }, [isLoggedIn, role]);

  const fetchSyllabuses = useCallback(
    async (page: number = 1, pageSize: number = 10, gradeId: number = 0) => {
      if (!selectedYear) return; // Add this guard clause
      
      setTableLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const params = new URLSearchParams();
        params.append('yearId', selectedYear.toString());
        if (selectedStatus) params.append('status', selectedStatus);
        params.append('page', page.toString());
        params.append('size', pageSize.toString());
        params.append('gradeId', gradeId.toString());
        
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/syllabus?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.data.status === "success") {
          setSyllabuses(response.data.data);
          setPagination((prevPagination) => ({
            ...prevPagination,
            total: response.data.pageResponse.totalElements,
            current: response.data.pageResponse.currentPage + 1,
            pageSize: response.data.pageResponse.pageSize,
          }));
        } else {
          message.error("Lấy danh sách giáo trình thất bại");
        }
      } catch (error) {
        console.error("Error fetching syllabuses:", error);
        message.error("Lấy danh sách giáo trình thất bại");
      } finally {
        setTableLoading(false);
      }
    },
    [selectedYear, selectedStatus]
  );  

  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchSyllabuses(page, pageSize || pagination.pageSize);
  };

  const handleGradeChange = (value: number | null) => {
    setSelectedGrade(value);
    if (selectedYear !== null) {
      fetchSyllabuses(1, pagination.pageSize, value || 0);
    }
  };

  const handleYearChange = (value: number | null) => {
    setSelectedYear(value);
    setIsYearSelected(value !== null);
    // Remove the fetch call from here as it will be handled by the useEffect
  };

  useEffect(() => {
    if (isLoggedIn && role === "ADMIN" && selectedYear !== null) {
      fetchSyllabuses(1, pagination.pageSize, selectedGrade || 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedGrade, selectedStatus]);

  const columns = [
    {
      title: "STT",
      dataIndex: ["syllabus", "id"],
      key: "id",
    },
    {
      title: "Tên giáo trình",
      dataIndex: ["syllabus", "name"],
      key: "syllabusName",
    },
    {
      title: "Thời gian",
      dataIndex: ["syllabus", "duration"],
      key: "duration",
    },
    {
      title: "Khối",
      dataIndex: ["grade", "name"],
      key: "gradeName",
      render: (text: string) => (
        <Tag color="blue" className="px-3 py-1 rounded-full">
          {text}
        </Tag>
      ),
    },
    {
      title: "Niên khóa",
      dataIndex: ["academicYear", "year"],
      key: "academicYear",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <Tag
          color={text === "ACTIVE" ? "green" : "orange"}
          className="px-3 py-1 rounded-full"
        >
          {text === "ACTIVE" ? "Đang áp dụng" : "Không áp dụng"}
        </Tag>
      ),
    },
  ];

  const handleRowClick = (record: Syllabus) => {
    navigate(`/syllabus-detail/${record.syllabus.id}`);
  };

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
          Danh sách giáo trình
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
                onChange={handleYearChange}
                value={selectedYear}
                allowClear
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
                allowClear
              >
                {grades.map((grade) => (
                  <Select.Option key={grade.id} value={grade.id}>
                    {grade.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Trạng thái
              </label>
              <Select
                className="w-full"
                placeholder="Chọn trạng thái"
                onChange={(value) => setSelectedStatus(value)}
                value={selectedStatus}
                allowClear
              >
                <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
              </Select>
            </div>
          </div>
        </Card>
        {isYearSelected ? (
          <Table
            columns={columns}
            dataSource={syllabuses}
            rowKey="id"
            loading={tableLoading}
            className="bg-white rounded-lg shadow"
            pagination={{
              current: pagination.current,
              total: pagination.total,
              pageSize: pagination.pageSize,
              onChange: handlePaginationChange,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng cộng ${total} mục`,
              className: "mt-4",
            }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              className:
                "hover:bg-gray-50 cursor-pointer transition-colors duration-150",
            })}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg font-semibold">Vui lòng chọn niên khóa</p>
            <p className="text-sm">
              Chọn một niên khóa để xem danh sách giáo trình
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default ListSyllabusScreen;

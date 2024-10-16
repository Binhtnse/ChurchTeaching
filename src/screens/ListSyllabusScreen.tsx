import React, { useEffect, useState, useCallback } from "react";
import { Table, Typography, Tag, message, Select, Spin } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

interface Syllabus {
  id: number;
  grade: {
    name: string;
    age: number;
  };
  syllabus: {
    name: string;
    duration: string;
  };
  academicYear: {
    year: string;
  };
  isCurrent: string;
}

const ListSyllabusScreen: React.FC = () => {
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, isLoggedIn } = useAuthState();
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string }[]
  >([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

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
      } else {
        message.error("Failed to fetch grades");
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      message.error("An error occurred while fetching grades");
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
      message.error("Failed to fetch academic years");
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
      try {
        const yearId = `&yearId=${selectedYear}`;
        const status = selectedStatus ? `status=${selectedStatus}` : '';
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/syllabus?${status}&page=${page}&size=${pageSize}&gradeId=${gradeId}${yearId}`
        );
        setSyllabuses(response.data.data);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: response.data.pageResponse.totalElements,
          current: response.data.pageResponse.currentPage + 1,
          pageSize: response.data.pageResponse.pageSize,
        }));
      } catch (error) {
        console.error("Error fetching syllabuses:", error);
      } finally {
        setLoading(false);
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

  useEffect(() => {
    if (isLoggedIn && role === "ADMIN" && selectedYear !== null) {
      fetchSyllabuses(1, pagination.pageSize);
    }
  }, [isLoggedIn, role, pagination.pageSize, fetchSyllabuses, selectedYear, selectedStatus]);

  const handleYearChange = (value: number | null) => {
    setSelectedYear(value);
    if (value !== null) {
      fetchSyllabuses(1, pagination.pageSize, selectedGrade || 0);
    }
  };

  useEffect(() => {
    if (isLoggedIn && role === "ADMIN") {
      fetchSyllabuses(1, pagination.pageSize);
    }
  }, [isLoggedIn, role, pagination.pageSize, fetchSyllabuses]);

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
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
      render: (text: string) => <Tag color="blue" className="px-3 py-1 rounded-full">{text}</Tag>,
    },
    {
      title: "Niên khóa",
      dataIndex: ["academicYear", "year"],
      key: "academicYear",
    },
    {
      title: "Current",
      dataIndex: "isCurrent",
      key: "isCurrent",
      render: (text: string) => (
        <Tag color={text === "true" ? "green" : "orange"} className="px-3 py-1 rounded-full">
          {text === "true" ? "Đang áp dụng" : "Chưa áp dụng"}
        </Tag>
      ),
    },
  ];

  const handleRowClick = (record: Syllabus) => {
    navigate(`/syllabus-detail/${record.id}`);
  };

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <Title level={2} className="mb-6">
          Danh sách giáo trình
        </Title>
        <div className="mb-6 flex justify-start items-center space-x-4">
          <Select
            style={{ width: 200 }}
            placeholder="Chọn niên khóa"
            onChange={handleYearChange}
            value={selectedYear}
            allowClear
            className="border rounded-md"
          >
            {academicYears.map((year) => (
              <Select.Option key={year.id} value={year.id}>
                {year.year}
              </Select.Option>
            ))}
          </Select>
          <Select
            style={{ width: 200, marginRight: 16 }}
            placeholder="Chọn khối"
            onChange={handleGradeChange}
            value={selectedGrade}
            allowClear
            className="border rounded-md"
          >
            {grades.map((grade) => (
              <Select.Option key={grade.id} value={grade.id}>
                {grade.name}
              </Select.Option>
            ))}
          </Select>
          <Select
  style={{ width: 200 }}
  placeholder="Chọn trạng thái"
  onChange={(value) => setSelectedStatus(value)}
  value={selectedStatus}
  allowClear
  className="border rounded-md"
>
  <Select.Option value="ACTIVE">Hoạt động</Select.Option>
  <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
</Select>
        </div>
        <Table
          columns={columns}
          dataSource={syllabuses}
          rowKey="id"
          loading={loading}
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
            className: "hover:bg-gray-50 cursor-pointer transition-colors duration-150",
          })}
        />
      </div>
    </div>
  );
};
export default ListSyllabusScreen;

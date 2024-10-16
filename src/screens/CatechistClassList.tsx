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

  useEffect(() => {
    fetchAcademicYears();
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
        const response = await axios.get<ApiResponse>(
          `https://sep490-backend-production.up.railway.app/api/v1/class/catechist/${userId}?page=${page}&size=${pageSize}`,
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
    [selectedYear]
  );

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
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
      title: "Tên lớp",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Khối",
      dataIndex: "gradeName",
      key: "gradeName",
    },
    {
      title: "Niên Khóa",
      dataIndex: "academicYear",
      key: "academicYear",
    },
  ];

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        Lớp của giáo lý viên
      </Title>
      <Select
        style={{ width: 200, marginBottom: 16 }}
        placeholder="Chọn niên khóa"
        onChange={handleYearChange}
        value={selectedYear}
      >
        {academicYears.map((year) => (
          <Select.Option key={year.id} value={year.id}>
            {year.year}
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
            className="bg-white rounded-lg shadow"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: 'pointer' }
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

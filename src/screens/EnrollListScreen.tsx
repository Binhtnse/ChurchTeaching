import React, { useEffect, useState, useCallback } from "react";
import { Table, Tag, Pagination, Input, Select, message } from "antd";
import { Link } from "react-router-dom";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";
import usePageTitle from "../hooks/usePageTitle";

interface DataType {
  id: number;
  key: React.Key;
  name: string;
  status: string;
  grade: string;
  academicYear: string;
  email: string | null;
  description: string;
  link: string;
  survey: string;
}

const { Search } = Input;
const { Option } = Select;

const EnrollListScreen: React.FC = () => {
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [allData, setAllData] = useState<DataType[]>([]);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    number | null
  >(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    if (isLoggedIn && role === "ADMIN") {
      fetchAcademicYears();
      fetchGrades();
    }
  }, [isLoggedIn, role]);

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      console.log("Academic Years Data:", response.data);
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
      } else {
        message.error("Failed to fetch grades");
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      message.error("An error occurred while fetching grades");
    }
  };

  useEffect(() => {
    setPageTitle("Danh sách đơn đăng ký học", "#4154f1");
  }, [setPageTitle]);

  const fetchData = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (!selectedAcademicYear || !isLoggedIn || role !== "ADMIN") {
        return;
      }
      setLoading(true);
      try {
        const gradeParam = selectedGrade ? `&gradeId=${selectedGrade}` : "";
        const statusParam = statusFilter ? `&status=${statusFilter}` : "";
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/register-infor?page=${page}&size=${pageSize}&academicYearId=${selectedAcademicYear}${gradeParam}${statusParam}`
        );
        const { data } = response.data;
        const formattedData = data.map((item: DataType) => ({
          key: item.id,
          name: item.name,
          status: item.status,
          grade: item.grade,
          academicYear: item.academicYear,
          email: item.email,
          description: item.description,
          link: item.link,
          survey: item.survey,
        }));
        setAllData(formattedData);
        setDataSource(formattedData);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: response.data.pageResponse.totalPage * pageSize,
          current: page,
          pageSize: pageSize,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn, role, selectedAcademicYear, selectedGrade, statusFilter]
  );

  useEffect(() => {
    if (selectedAcademicYear && isLoggedIn && role === "ADMIN") {
      fetchData(1, pagination.pageSize);
    }
  }, [selectedAcademicYear, isLoggedIn, role, pagination.pageSize, fetchData]);

  const handleGradeChange = (value: number) => {
    setSelectedGrade(value);
  };

  const handleAcademicYearChange = (value: number) => {
    setSelectedAcademicYear(value);
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchData(page, pageSize || pagination.pageSize);
  };

  const filterData = (searchValue: string, statusValue: string | null) => {
    return allData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase()) &&
        (!statusValue || item.status === statusValue)
    );
  };

  const handleSearch = (value: string) => {
    const filteredData = filterData(value, statusFilter);
    setDataSource(filteredData);
  };

  const handleStatusFilter = (value: string | null) => {
    setStatusFilter(value);
    const searchInput = document.querySelector<HTMLInputElement>(
      ".ant-input-search input"
    );
    const searchValue = searchInput ? searchInput.value : "";
    const filteredData = filterData(searchValue, value);
    setDataSource(filteredData);
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: "10%",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Người làm đơn đăng ký",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Khối",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Niên khóa",
      dataIndex: "academicYear",
      key: "academicYear",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        let icon = null;
        let text = "";
    
        switch (status) {
          case "APPROVE":
            color = "success";
            icon = <CheckCircleOutlined />;
            text = "Đã đồng ý";
            break;
          case "PENDING":
            color = "processing";
            icon = <ClockCircleOutlined />;
            text = "Đang chờ";
            break;
          case "REJECTED":
            color = "error";
            icon = <CloseCircleOutlined />;
            text = "Đã từ chối";
            break;
        }
    
        return (
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: DataType) => (
        <Link to={`/enroll-list/${record.key}`}>Xem chi tiết</Link>
      ),
    },
  ];

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Select
          className="w-48"
          placeholder="Chọn niên khóa"
          onChange={handleAcademicYearChange}
          allowClear
        >
          {academicYears.map((year) => (
            <Option key={year.id} value={year.id}>
              {year.year} {year.timeStatus === "NOW" ? "(Hiện tại)" : ""}
            </Option>
          ))}
        </Select>
        <Select
          className="w-48"
          placeholder="Chọn khối"
          onChange={handleGradeChange}
          value={selectedGrade}
          allowClear
        >
          {grades.map((grade) => (
            <Option key={grade.id} value={grade.id}>
              {grade.name}
            </Option>
          ))}
        </Select>
        <Search
          placeholder="Tìm theo tên"
          onSearch={handleSearch}
          className="w-64"
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select
          className="w-48"
          placeholder="Lọc theo trạng thái"
          onChange={handleStatusFilter}
          allowClear
        >
          <Option value="APPROVE">Đồng ý</Option>
          <Option value="PENDING">Đang chờ</Option>
          <Option value="REJECT">Từ chối</Option>
        </Select>
      </div>
      {selectedAcademicYear ? (
        <>
          <Table
            dataSource={dataSource}
            columns={columns}
            bordered
            loading={loading}
            pagination={false}
            className="mb-4 overflow-x-auto"
            rowClassName="hover:bg-gray-50"
          />
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={handlePaginationChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Tổng ${total} mục`}
            className="mt-4 text-right"
          />
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-semibold">Vui lòng chọn niên khóa</p>
          <p className="text-sm">
            Chọn một niên khóa để xem danh sách đơn đăng ký
          </p>
        </div>
      )}
    </div>
  );
};
export default EnrollListScreen;

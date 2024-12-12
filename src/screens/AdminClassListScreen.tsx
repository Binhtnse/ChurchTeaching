/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Space,
  Button,
  message,
  Input,
  Select,
  Pagination,
  Tag,
  Card,
} from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import usePageTitle from "../hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;

interface DataType {
  id: number;
  name: string;
  numberOfCatechist: number | null;
  gradeName: string;
  academicYear: string;
  status: string;
}

const AdminClassListScreen: React.FC = () => {
  const navigate = useNavigate();
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
      } else {
        message.error("Failed to fetch grades");
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
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
        const token = localStorage.getItem("accessToken");
        const gradeParam = selectedGrade ? `&gradeId=${selectedGrade}` : "";
        const statusParam = statusFilter ? `&status=${statusFilter}` : "";
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/class/list?page=${page}&size=${pageSize}&academicYearId=${selectedAcademicYear}${gradeParam}${statusParam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { data } = response.data;

        // Handle empty data case
        if (!data || data.length === 0) {
          setAllData([]);
          setDataSource([]);
          setPagination((prevPagination) => ({
            ...prevPagination,
            total: 0,
            current: 1,
          }));
          return;
        }

        const formattedData = data.map((item: DataType) => ({
          key: item.id,
          id: item.id,
          name: item.name,
          status: item.status,
          grade: item.gradeName,
          academicYear: item.academicYear,
          numberOfCatechist: item.numberOfCatechist,
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
        message.error("Không thể tải danh sách lớp giáo lý. Vui lòng thử lại sau");
        setAllData([]);
        setDataSource([]);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: 0,
          current: 1,
        }));
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
  const handleExport = async () => {
    if (!selectedAcademicYear) {
      message.warning("Vui lòng chọn niên khóa trước khi xuất danh sách");
      return;
    }
  
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/export?academicYearId=${selectedAcademicYear}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        }
      );
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
  
      const link = document.createElement("a");
      link.href = url;
  
      const contentDisposition = response.headers["content-disposition"];
      const fileName = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "exported_file.xlsx";
  
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
  
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.log(error);
      if (error.response.data.message) {
        message.error(`Lỗi ${error.response.data.message}`);
      } else {
        message.error(`Lỗi ${error.message}`);
      }
    }
  };
  const columns = [
    {
      title: "STT",
      key: "index",
      width: "10%",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Tên lớp",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số lượng giáo lý viên",
      dataIndex: "numberOfCatechist",
      key: "numberOfCatechist",
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

        switch (status) {
          case "ACTIVE":
            color = "success";
            icon = <CheckCircleOutlined />;
            status = "Hoạt động";
            break;
          case "PENDING":
            color = "processing";
            icon = <ClockCircleOutlined />;
            status = "Đang chờ";
            break;
          case "INACTIVE":
            color = "default";
            icon = <CloseCircleOutlined />;
            status = "Không hoạt động";
            break;
          case "REJECTED":
            color = "error";
            icon = <CloseCircleOutlined />;
            status = "Từ chối";
            break;
        }

        return (
          <Tag icon={icon} color={color}>
            {status}
          </Tag>
        );
      },
    },
    // {
    //   title: "Hành động",
    //   key: "action",
    //   render: (_: unknown, record: DataType) => (
    //     <Link to={`/enroll-list/${record.id}`}>Xem chi tiết</Link>
    //   ),
    // },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: DataType) => (
        <Space size="middle">
          {/* <EditClassModal classId={record.id} /> */}
          {/* <Button danger icon={<DeleteOutlined />}>
            Delete
          </Button> */}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/class/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
          Danh sách lớp giáo lý
        </h1>
        <div className="gap-2 flex">
          <Button
            type="primary"
            className=" px-4 py-2 rounded"
            onClick={handleExport}
          >
            <ExportOutlined />
            Xuất danh sách
          </Button>

        </div>
      </div>
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
              value={selectedGrade}
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
            <label className="text-sm font-medium text-gray-600">
              Trạng thái
            </label>
            <Select
              className="w-full"
              placeholder="Lọc theo trạng thái"
              onChange={handleStatusFilter}
              allowClear
            >
              <Option value="APPROVE">Đồng ý</Option>
              <Option value="PENDING">Đang chờ</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
              <Option value="REJECT">Từ chối</Option>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-medium text-gray-600">
              Tìm kiếm
            </label>
            <Search
              placeholder="Tìm theo tên"
              onSearch={handleSearch}
              className="w-full"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {selectedAcademicYear ? (
        <>
          <Table
            dataSource={dataSource}
            columns={columns}
            bordered
            loading={loading}
            pagination={false}
          />
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={handlePaginationChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Total ${total} items`}
            className="mt-4 text-right"
          />
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-semibold">Vui lòng chọn niên khóa</p>
          <p className="text-sm">
            Chọn một niên khóa để xem danh sách lớp giáo lý
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminClassListScreen;

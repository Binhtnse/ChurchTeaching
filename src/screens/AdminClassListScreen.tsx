/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Space,
  Button,
  message,
  notification,
  Input,
  Select,
} from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { EditOutlined, ExportOutlined } from "@ant-design/icons";
import usePageTitle from "../hooks/usePageTitle";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { TableProps } from "antd";
import CreateClassModal from "../components/CreateClassModal";
import ImportFileModal from "../components/ImportFileModal";

const Context = React.createContext({ message: "Default" });
const { Search } = Input;
const { Option } = Select;
interface ClassData {
  id: number;
  name: string;
  numberOfCatechist: number | null;
  gradeName: string;
  academicYear: string;
  status: string;
}

const AdminClassListScreen: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const contextValue = useMemo(() => ({ message: "Ant Design" }), []);

  const navigate = useNavigate();
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const { setPageTitle } = usePageTitle();
  const [data, setData] = useState<ClassData[]>([]);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    number | null
  >(null);
  console.log(selectedAcademicYear);

  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 2,
    totalPage: 0,
  });
  const [searchParams, setSearchParams] = useSearchParams();

  const API_URL =
    "https://sep490-backend-production.up.railway.app/api/v1/class/list";
  const DEFAULT_PAGE_SIZE = 5;

  const handleExport = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/class/export",
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
        api.error({
          message: `Lỗi ${error.response.data.message}`,
          placement: "topRight",
        });
      } else {
        api.error({
          message: `Lỗi ${error.message}`,
          placement: "topRight",
        });
      }
    }
  };

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);
  useEffect(() => {
    setPageTitle("Danh sách lớp học", "#4154f1");
  }, [setPageTitle]);
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const handleAcademicYearChange = (value: number) => {
    setSelectedAcademicYear(value);
  };
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

  const fetchData = async (
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}?page=${page}&size=${pageSize}`
      );
      const { data, pageResponse } = response.data;

      setData(data);
      setPagination({
        current: pageResponse.currentPage,
        pageSize: pageResponse.pageSize,
        totalPage: pageResponse.totalPage * pageResponse.pageSize,
      });
    } catch (error) {
      message.error("Failed to load class data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQueryParams = (page: number, pageSize: number) => {
    setSearchParams({ page: String(page), size: String(pageSize) });
  };

  useEffect(() => {
    if (isLoggedIn && role === "ADMIN") {
      const page = searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : 1;
      const size = searchParams.get("size")
        ? parseInt(searchParams.get("size")!)
        : DEFAULT_PAGE_SIZE;

      fetchData(page, size);
    }
  }, [isLoggedIn, role, searchParams]);

  const handleTableChange = (pagination: any) => {
    updateQueryParams(pagination.current, pagination.pageSize);
  };

  const columns: TableProps<ClassData>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên Lớp",
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
      dataIndex: "gradeName",
      key: "gradeName",
    },
    {
      title: "Năm học",
      dataIndex: "academicYear",
      key: "academicYear",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <Context.Provider value={contextValue}>{contextHolder}</Context.Provider>
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">
          Danh sách lớp giáo lý
        </h1>
        <div className="gap-2 flex">
          <CreateClassModal />
          <Button
            type="primary"
            className=" px-4 py-2 rounded"
            onClick={handleExport}
          >
            <ExportOutlined />
            Export
          </Button>

          <ImportFileModal />
        </div>
      </div>
      <div className="flex flex-wrap gap-5">
        <Search
          placeholder="Tìm theo tên lớp"
          // onSearch={handleSearch}
          style={{ width: 200 }}
          // onChange={(e) => handleSearch(e.target.value)}
        />
        <Select
          style={{ width: 200, marginRight: 16 }}
          placeholder="Chọn niên khóa"
          onChange={handleAcademicYearChange}
        >
          {academicYears.map((year) => (
            <Option key={year.id} value={year.id}>
              {year.year} {year.timeStatus === "NOW" ? "(Hiện tại)" : ""}
            </Option>
          ))}
        </Select>
        <Select
          style={{ width: 200 }}
          placeholder="Lọc theo trạng thái"
          // onChange={handleStatusFilter}
          allowClear
        >
          <Option value="APPROVE">Đồng ý</Option>
          <Option value="PENDING">Đang chờ</Option>
          <Option value="REJECT">Từ chối</Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        onRow={() => {
          return {
            className: "hover:bg-gray-100 transition-colors duration-200",
          };
        }}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.totalPage,
        }}
        onChange={handleTableChange}
        className="bg-white rounded-lg shadow-lg"
      />
    </div>
  );
};

export default AdminClassListScreen;

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
import CreateClassModal from "../components/CreateClassModal";
import ImportFileModal from "../components/ImportFileModal";

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
          `https://sep490-backend-production.up.railway.app/api/v1/class/list?page=${page}&size=${pageSize}&academicYearId=${selectedAcademicYear}${gradeParam}${statusParam}`
        );
        const { data } = response.data;
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
      title: "Số lượng giáo viên",
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
          case "APPROVE":
            color = "success";
            icon = <CheckCircleOutlined />;
            break;
          case "PENDING":
            color = "processing";
            icon = <ClockCircleOutlined />;
            break;
          case "REJECTED":
            color = "error";
            icon = <CloseCircleOutlined />;
            break;
        }

        return (
          <Tag icon={icon} color={color}>
            {status === "REJECTED" ? "REJECT" : status.toUpperCase()}
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
    <div className="p-6 bg-gray-100 min-h-screen">
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
      <div style={{ marginBottom: 16 }}>
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
          style={{ width: 200, marginRight: 16 }}
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
          style={{ width: 200, marginRight: 16 }}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Select
          style={{ width: 120 }}
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
        <div>Vui lòng chọn niên khóa</div>
      )}
    </div>
  );
};

export default AdminClassListScreen;

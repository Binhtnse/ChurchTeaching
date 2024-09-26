import React, { useEffect, useState } from "react";
import { Table, Tag, Pagination, Input, Select } from "antd";
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
  key: React.Key;
  name: string;
  status: string;
  major: string;
}

const { Search } = Input;
const { Option } = Select;

const EnrollListScreen: React.FC = () => {
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
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
    setPageTitle('Danh sách đăng ký học');
  }, [setPageTitle]);


  const fetchData = async (page: number = 0, pageSize: number = 10) => {
    if (isLoggedIn && role === "ADMIN") {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/register-infor?page=${page}&size=${pageSize}&name=${searchText}&status=${statusFilter || ''}`
        );
        const { content, totalElements } = response.data.data;
        const formattedData = content.map(
          (item: {
            id: React.Key;
            name: string;
            status: string;
            grade: {
              major: {
                name: string;
              };
            };
          }) => ({
            key: item.id,
            name: item.name,
            status: item.status,
            major: item.grade.major.name,
          })
        );
        setDataSource(formattedData);
        setPagination({
          ...pagination,
          total: totalElements,
          current: page + 1,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, role, searchText, statusFilter]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    fetchData(page - 1, pageSize);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(0, pagination.pageSize);
  };
  
  const handleStatusFilter = (value: string | null) => {
    setStatusFilter(value);
    fetchData(0, pagination.pageSize);
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
      title: "Ngành",
      dataIndex: "major",
      key: "major",
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
          case "REJECT":
            color = "error";
            icon = <CloseCircleOutlined />;
            break;
        }

        return (
          <Tag icon={icon} color={color}>
            {status.toUpperCase()}
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
    <div>
      <div style={{ marginBottom: 16 }}>
      <Search
        placeholder="Search by name"
        onSearch={handleSearch}
        style={{ width: 200, marginRight: 16 }}
      />
      <Select
        style={{ width: 120 }}
        placeholder="Filter by status"
        onChange={handleStatusFilter}
        allowClear
      >
        <Option value="APPROVE">Đồng ý</Option>
        <Option value="PENDING">Đang chờ</Option>
        <Option value="REJECT">Từ chối</Option>
      </Select>
    </div>
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
      />
    </div>
  );
};
export default EnrollListScreen;
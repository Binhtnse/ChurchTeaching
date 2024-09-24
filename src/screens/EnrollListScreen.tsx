import React, { useEffect, useState } from "react";
import { Table, Tag, Pagination } from "antd";
import { Link } from "react-router-dom";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";

interface DataType {
  key: React.Key;
  name: string;
  status: string;
  major: string;
}

const EnrollListScreen: React.FC = () => {
  const { isLoggedIn, role, checkAuthState } = useAuthState();
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const fetchData = async (page: number = 0, pageSize: number = 10) => {
    if (isLoggedIn && role === "ADMIN") {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/register-infor?page=${page}&size=${pageSize}`
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
  }, [isLoggedIn, role]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    fetchData(page - 1, pageSize);
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
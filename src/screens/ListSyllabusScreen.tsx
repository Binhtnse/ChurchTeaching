import React, { useEffect, useState } from "react";
import { Table, Typography, Tag } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

interface Syllabus {
  id: number;
  name: string;
  duration: string;
  levelName: string;
  levelID: number;
}

const ListSyllabusScreen: React.FC = () => {
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, isLoggedIn } = useAuthState();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

  const fetchSyllabuses = async (page: number = 1, pageSize: number = 10) => {
    try {
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/syllabus?status=ACTIVE&page=${page}&size=${pageSize}`
      );
      setSyllabuses(
        response.data.data.map((item: Syllabus) => ({
          id: item.id,
          name: item.name,
          duration: item.duration,
          levelName: item.levelName,
          levelID: item.levelID,
        }))
      );
      setPagination((prevPagination) => ({
        ...prevPagination,
        total: response.data.pageResponse.totalPage * pageSize,
        current: page,
        pageSize: pageSize,
      }));
    } catch (error) {
      console.error("Error fetching syllabuses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    fetchSyllabuses(page, pageSize || pagination.pageSize);
  };

  useEffect(() => {
    if (isLoggedIn && role === "ADMIN") {
      fetchSyllabuses(1, pagination.pageSize);
    }
  }, [isLoggedIn, role, pagination.pageSize]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Level",
      dataIndex: "levelName",
      key: "levelName",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
  ];

  const handleRowClick = (record: Syllabus) => {
    navigate(`/syllabus-detail/${record.id}`);
  };

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">
        Syllabus List
      </Title>
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
          showTotal: (total) => `Total ${total} items`,
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
};

export default ListSyllabusScreen;

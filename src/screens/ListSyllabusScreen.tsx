import React, { useEffect, useState } from "react";
import { Table, Typography, Tag } from "antd";
import axios from "axios";
import { useAuthState } from '../hooks/useAuthState';
import ForbiddenScreen from './ForbiddenScreen';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSyllabuses = async () => {
      try {
        const response = await axios.get(
          "https://sep490-backend-production.up.railway.app/api/syllabus?status=ACTIVE&page=0&size=1&sort="
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
      } catch (error) {
        console.error("Error fetching syllabuses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && (role === 'ADMIN')) {
        fetchSyllabuses();
      }
  }, [isLoggedIn, role]);

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

  if (!isLoggedIn || (role !== 'ADMIN')) {
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
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
      />
    </div>
  );
};

export default ListSyllabusScreen;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Collapse, Typography, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';

const { Panel } = Collapse;
const { Title, Text } = Typography;

interface Material {
  name: string;
  link: string;
}

interface Slot {
  dayOfWeek: string;
  time: string;
  slotOrder: number;
  slotType: string;
  description: string;
  name: string;
  session: {
    name: string;
    description: string;
  };
  materials: Material[];
}

interface Class {
  className: string;
  grade: string;
  roomNo: string;
  status: string;
  slots: Slot[];
}

interface WeekSchedule {
  weekNumber: number;
  startDate: string;
  endDate: string;
  classes: Class[];
}

interface ScheduleData {
  teacherId: number;
  academicYear: string;
  schedule: WeekSchedule[];
}

const CatechistScheduleScreen: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get('https://sep490-backend-production.up.railway.app/api/v1/schedule/catechist/8');
        setScheduleData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const columns: ColumnsType<Slot> = [
    {
      title: 'Ngày',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Bài học',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  if (loading) {
    return <Spin size="large" className="flex justify-center items-center h-screen" />;
  }

  return (
    <div className="p-6">
      <Title level={2}>Lịch Giảng Dạy</Title>
      <Text strong>Niên Khóa: {scheduleData?.academicYear}</Text>

      <Collapse className="mt-4">
        {scheduleData?.schedule.map((week) => (
          <Panel
            header={`Tuần ${week.weekNumber} (${week.startDate} - ${week.endDate})`}
            key={week.weekNumber}
          >
            {week.classes.map((classItem, index) => (
              <Card
                key={index}
                title={`${classItem.className} - ${classItem.grade}`}
                className="mb-4"
              >
                <Text>Phòng: {classItem.roomNo}</Text>
                <Table
                  dataSource={classItem.slots}
                  columns={columns}
                  rowKey="slotOrder"
                  pagination={false}
                  className="mt-4"
                />
              </Card>
            ))}
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default CatechistScheduleScreen;

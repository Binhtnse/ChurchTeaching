import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Typography, Spin, Card, Row, Col } from 'antd';

const { Title, Text } = Typography;

interface Slot {
    id: number;
    name: string;
    description: string;
    orderSlot: number;
    slotType: string;
  }
  
  interface Session {
    id: number;
    name: string;
    description: string;
    numberOfSlot: number;
    slots: Slot[];
  }
  
  interface SyllabusData {
    name: string;
    duration: string;
    levelName: string;
    sessions: Session[];
  }

const SyllabusDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabusDetail = async () => {
      try {
        const response = await axios.get(`https://sep490-backend-production.up.railway.app/api/syllabus/${id}`);
        setSyllabus(response.data.data);
      } catch (error) {
        console.error('Error fetching syllabus detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabusDetail();
  }, [id]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (!syllabus) {
    return <Text>Syllabus not found</Text>;
  }

  return (
    <div className="p-6">
      <Title level={2}>{syllabus.name}</Title>
      <Text>Duration: {syllabus.duration}</Text>
      <br />
      <Text>Level: {syllabus.levelName}</Text>

      {syllabus.sessions.map((session) => (
        <div key={session.id} className="mt-6">
          <Title level={3}>{session.name}</Title>
          <Text>{session.description}</Text>
          <Row gutter={[16, 16]} className="mt-4">
            {session.slots.map((slot) => (
              <Col span={8} key={slot.id}>
                <Card title={slot.name} extra={`Order: ${slot.orderSlot}`}>
                  <p><strong>Description:</strong> {slot.description}</p>
                  <p><strong>Type:</strong> {slot.slotType}</p>
                  <p><strong>Session:</strong> {session.name}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default SyllabusDetailScreen;

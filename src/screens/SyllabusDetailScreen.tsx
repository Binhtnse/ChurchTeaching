import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Typography, Spin, Card, Row, Col, Select, Collapse } from "antd";
import { ClockCircleOutlined, BookOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

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
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  useEffect(() => {
    const fetchSyllabusDetail = async () => {
      try {
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/syllabus/${id}`
        );
        setSyllabus(response.data.data);
      } catch (error) {
        console.error("Error fetching syllabus detail:", error);
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

  const handleSessionChange = (value: number) => {
    setSelectedSession(value);
    setSelectedSlot(null);
  };

  const handleSlotChange = (value: number) => {
    setSelectedSlot(value);
  };

  const filteredSessions = selectedSession
    ? syllabus.sessions.filter((session) => session.id === selectedSession)
    : syllabus.sessions;

  const filteredSlots = selectedSession
    ? syllabus.sessions.find((session) => session.id === selectedSession)
        ?.slots || []
    : syllabus.sessions.flatMap((session) => session.slots);

  const displaySlots = selectedSlot
    ? filteredSlots.filter((slot) => slot.id === selectedSlot)
    : filteredSlots;

  return (
    <div className="p-6">
      <Card className="mb-6">
        <Title level={2}>{syllabus.name}</Title>
        <Row gutter={16}>
          <Col span={12}>
            <ClockCircleOutlined /> <Text strong>Duration:</Text> {syllabus.duration}
          </Col>
          <Col span={12}>
            <BookOutlined /> <Text strong>Level:</Text> {syllabus.levelName}
          </Col>
        </Row>
      </Card>

      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select a session"
            onChange={handleSessionChange}
            allowClear
          >
            {syllabus.sessions.map((session) => (
              <Option key={session.id} value={session.id}>
                {session.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={12}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select a slot"
            onChange={handleSlotChange}
            allowClear
            disabled={!selectedSession}
          >
            {filteredSlots.map((slot) => (
              <Option key={slot.id} value={slot.id}>
                {slot.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Collapse defaultActiveKey={[filteredSessions[0]?.id]}>
        {filteredSessions.map((session) => (
          <Panel header={session.name} key={session.id}>
            <Text>{session.description}</Text>
            {displaySlots
              .filter((slot) => session.slots.some((s) => s.id === slot.id))
              .map((slot) => (
                <Card key={slot.id} title={slot.name} className="mt-4">
                  <p><Text strong>Description:</Text> {slot.description}</p>
                  <p><UserOutlined /> <Text strong>Slot Type:</Text> {slot.slotType}</p>
                </Card>
              ))}
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default SyllabusDetailScreen;

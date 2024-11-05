import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Typography, Spin, Card, Row, Col, Select, Collapse, Button } from "antd";
import { ClockCircleOutlined, UserOutlined, LinkOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface Material {
  name: string;
  links: string[];
}

interface Slot {
  id: number;
  name: string;
  description: string;
  orderSlot: number;
  slotType: string;
  materialRequestDTO: Material;
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
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  useEffect(() => {
    const fetchSyllabusDetail = async () => {
      try {
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/syllabus/${id}?status=ACTIVE`
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

  const handleSessionChange = (value: number | 'all') => {
    setSelectedSession(value === 'all' ? null : value);
    setSelectedSlot(null);
  };

  const handleSlotChange = (value: number | 'all') => {
    setSelectedSlot(value === 'all' ? null : value);
  };

  const handleReturn = () => {
    navigate('/list-syllabus');
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
       <Button 
        type="primary"
        onClick={handleReturn}
        className="mb-4"
        icon={<ArrowLeftOutlined />}
      >
        Quay lại danh sách
      </Button>
      <Card className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">{syllabus.name}</h1>
        <Row gutter={16}>
          <Col span={12}>
            <ClockCircleOutlined /> <Text strong>Thời gian:</Text> {syllabus.duration}
          </Col>
        </Row>
      </Card>

      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn chương"
            onChange={handleSessionChange}
            allowClear
          >
            <Option key="all" value="all">Tất cả</Option>
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
            placeholder="Chọn tiết"
            onChange={handleSlotChange}
            allowClear
          >
            <Option key="all" value="all">Tất cả</Option>
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
                  <p><Text strong>Mô tả:</Text> {slot.description}</p>
                  <p><UserOutlined /> <Text strong>Loại tiết học:</Text> {slot.slotType}</p>
                  {slot.materialRequestDTO && (
                    <div>
                      <Text strong>Tài liệu:</Text>
                      <p>{slot.materialRequestDTO.name}</p>
                      {slot.materialRequestDTO.links.map((link, index) => (
                        <Button 
                          key={index}
                          type="link" 
                          icon={<LinkOutlined />}
                          href={link}
                          target="_blank"
                        >
                          Link tài liệu {index + 1}
                        </Button>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default SyllabusDetailScreen;

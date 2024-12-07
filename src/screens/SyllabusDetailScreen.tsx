import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Spin,
  Card,
  Row,
  Col,
  Select,
  Collapse,
  Button,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  LinkOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const { Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface Material {
  name: string;
  links: string[];
}

interface Slot {
  id: number;
  name: string | null;
  description: string | null;
  orderSlot: number;
  slotType: string;
  examId: number;
  sessionUnits: number;
  examName: string;
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

const StyledContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const StyledHeader = styled(Card)`
  .ant-card-body {
    padding: 2rem;
  }
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StyledTitle = styled.h1`
  font-size: 2.5rem;
  color: #1890ff;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #1890ff;
`;

const StyledFilterSection = styled(Row)`
  margin-bottom: 2rem;
  .ant-select {
    border-radius: 8px;
  }
`;

const StyledCollapse = styled(Collapse)`
  .ant-collapse-header {
    font-size: 1.2rem;
    font-weight: 600;
    padding: 1rem 1.5rem !important;
  }

  .ant-collapse-content-box {
    padding: 1.5rem !important;
  }
`;

const StyledSlotCard = styled(Card)`
  margin-top: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .ant-card-head {
    background-color: #f8f9fa;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  .ant-card-body {
    padding: 1.5rem;
  }
`;

const StyledBackButton = styled(Button)`
  margin-bottom: 2rem;
  &:hover {
    transform: translateX(-3px);
    transition: transform 0.2s;
  }
`;

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
        const token = localStorage.getItem("accessToken"); 
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/syllabus/${id}?status=ACTIVE`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add Authorization header
            },
          }
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
    return <Text>Không tìm thấy giáo trình</Text>;
  }

  const handleSessionChange = (value: number | "all") => {
    setSelectedSession(value === "all" ? null : value);
    setSelectedSlot(null);
  };

  const handleSlotChange = (value: number | "all") => {
    setSelectedSlot(value === "all" ? null : value);
  };

  const handleReturn = () => {
    navigate("/list-syllabus");
  };

  const getVietnameseSlotType = (slotType: string) => {
    const typeMap: Record<string, string> = {
      lesson: "Bài học",
      lesson_exam: "Học và kiểm tra",
      exam: "Kiểm tra",
    };
    return typeMap[slotType] || slotType;
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
    <StyledContainer>
      <StyledBackButton
        type="primary"
        onClick={handleReturn}
        icon={<ArrowLeftOutlined />}
      >
        Quay lại danh sách
      </StyledBackButton>
      <StyledHeader>
        <StyledTitle>{syllabus.name}</StyledTitle>
        <Row gutter={16}>
          <Col span={12}>
            <ClockCircleOutlined className="text-blue-500 mr-2" />
            <Text strong>Thời gian:</Text>{" "}
            <span className="text-gray-700">{syllabus.duration}</span>
          </Col>
        </Row>
      </StyledHeader>

      <StyledFilterSection gutter={16}>
        <Col span={12}>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn chương"
            onChange={handleSessionChange}
            allowClear
          >
            <Option key="all" value="all">
              Tất cả
            </Option>
            {syllabus.sessions.map((session) => (
              <Option key={session.id} value={session.id}>
                {session.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={12}>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn tiết"
            onChange={handleSlotChange}
            allowClear
          >
            <Option key="all" value="all">
              Tất cả
            </Option>
            {filteredSlots.map((slot) => (
              <Option key={slot.id} value={slot.id}>
                Tiết {slot.orderSlot}
              </Option>
            ))}
          </Select>
        </Col>
      </StyledFilterSection>

      <StyledCollapse defaultActiveKey={[filteredSessions[0]?.id]}>
        {filteredSessions.map((session) => (
          <Panel header={session.name} key={session.id}>
            <Text>{session.description}</Text>
            {displaySlots
              .filter((slot) => session.slots.some((s) => s.id === slot.id))
              .map((slot) => (
                <StyledSlotCard
                  key={slot.id}
                  title={slot.name || slot.examName}
                >
                  {slot.description && (
                    <p>
                      <Text strong>Mô tả:</Text> {slot.description}
                    </p>
                  )}
                  <p>
                    <UserOutlined /> <Text strong>Loại tiết học:</Text>{" "}
                    {getVietnameseSlotType(slot.slotType)}
                  </p>
                  {slot.examName && (
                    <p>
                      <Text strong>Bài kiểm tra:</Text> {slot.examName}
                    </p>
                  )}
                  {slot.sessionUnits && (
                    <p>
                      <Text strong>Số tiết:</Text> {slot.sessionUnits}
                    </p>
                  )}
                  {slot.materialRequestDTO &&
                    slot.materialRequestDTO.links &&
                    slot.materialRequestDTO.links.some(
                      (link) => link !== ""
                    ) && (
                      <div>
                        <Text strong>Tài liệu:</Text>
                        {slot.materialRequestDTO.name && (
                          <p>{slot.materialRequestDTO.name}</p>
                        )}
                        {slot.materialRequestDTO.links.map(
                          (link, index) =>
                            link && (
                              <Button
                                key={index}
                                type="link"
                                icon={<LinkOutlined />}
                                href={link}
                                target="_blank"
                              >
                                Link tài liệu {index + 1}
                              </Button>
                            )
                        )}
                      </div>
                    )}
                </StyledSlotCard>
              ))}
          </Panel>
        ))}
      </StyledCollapse>
    </StyledContainer>
  );
};

export default SyllabusDetailScreen;

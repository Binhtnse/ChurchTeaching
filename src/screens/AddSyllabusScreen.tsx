import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  InputNumber,
  message,
  Spin,
  Row,
  Col,
  Typography,
  Collapse,
  Steps,
  Divider,
  List,
  Tag,
} from "antd";
import {
  PlusOutlined,
  BookOutlined,
  ScheduleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";

const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;

interface Grade {
  id: number;
  name: string;
}

const SyllabusPreview: React.FC<{
  formValues: {
    name: string;
    duration: string;
    grade: number;
    sessions: Array<{
      name: string;
      description: string;
      slotCount: number;
      slots: Array<{ name: string; description: string; type: string }>;
    }>;
  };
  grades: Grade[];
}> = ({ formValues, grades }) => {
  return (
    <div>
      <Title level={4}>{formValues.name}</Title>
      <Text>Thời lượng: {formValues.duration}</Text>
      <br />
      <Text>Khối: {grades.find((g) => g.id === formValues.grade)?.name}</Text>

      <Title level={5} className="mt-4">
        Phiên học
      </Title>
      <List
        dataSource={formValues.sessions}
        renderItem={(session, index: number) => (
          <List.Item>
            <List.Item.Meta
              title={`Phiên ${index + 1}: ${session.name}`}
              description={session.description}
            />
            <div>
              <Text strong>Số buổi học: {session.slotCount}</Text>
              <List
                dataSource={session.slots}
                renderItem={(slot, slotIndex: number) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`Buổi ${slotIndex + 1}: ${slot.name}`}
                      description={slot.description}
                    />
                    <Tag color="blue">{slot.type}</Tag>
                  </List.Item>
                )}
              />
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

const AddSyllabusScreen: React.FC = () => {
  const [form] = Form.useForm();
  const [sessions, setSessions] = useState<
    Array<{ slots: Array<Record<string, unknown>> }>
  >([]);
  const { role, isLoggedIn } = useAuthState();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

  const onFinish = async (values: {
    name: string;
    duration: string;
    grade: number;
    sessions: Array<{
      name: string;
      description: string;
      slotCount: number;
      slots: Array<{
        name: string;
        description: string;
        type: string;
      }>;
    }>;
  }) => {
    setLoading(true);
    try {
      const formattedData = {
        name: values.name,
        duration: values.duration,
        levelID: values.grade,
        sessions: values.sessions.map((session) => ({
          name: session.name,
          description: session.description,
          numberOfSlot: session.slotCount,
          slots: session.slots.map((slot, slotIndex) => ({
            name: slot.name,
            description: slot.description,
            orderSlot: slotIndex + 1,
            slotType: slot.type,
          })),
        })),
      };

      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/syllabus",
        formattedData
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Syllabus created successfully");
        form.resetFields();
        setSessions([]);
      } else {
        message.error("Failed to create syllabus");
      }
    } catch (error) {
      console.error("Error creating syllabus:", error);
      message.error("An error occurred while creating the syllabus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await axios.get(
          "https://sep490-backend-production.up.railway.app/api/grade?page=0&size=10"
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

    fetchGrades();
  }, []);

  const addSession = () => {
    setSessions([...sessions, { slots: [] }]);
  };

  const addSlot = (sessionIndex: number) => {
    const sessionFields = form.getFieldValue(["sessions", sessionIndex]);
    const currentSlots = sessions[sessionIndex].slots.length;
    const declaredSlotCount = sessionFields?.slotCount || 0;

    if (currentSlots < declaredSlotCount) {
      const newSessions = [...sessions];
      newSessions[sessionIndex].slots.push({});
      setSessions(newSessions);
    } else {
      message.warning(
        `You can't add more than ${declaredSlotCount} slots to this session.`
      );
    }
  };

  const steps = [
    {
      title: "General Info",
      content: (
        <Card title="Thông tin chung" className="mb-6">
          <Form.Item
            name="name"
            label="Tên Giáo Trình"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Thời Lượng"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="grade" label="Khối" rules={[{ required: true }]}>
            <Select>
              {grades.map((grade) => (
                <Option key={grade.id} value={grade.id}>
                  {grade.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>
      ),
    },
    {
      title: "Sessions",
      content: (
        <>
          <Title level={3}>
            <ScheduleOutlined /> Phiên học
          </Title>
          <Collapse>
            {sessions.map((session, sessionIndex) => (
              <Panel
                header={`Phiên học ${sessionIndex + 1}`}
                key={sessionIndex}
              >
                <Card className="mb-4" style={{ background: "#f0f2f5" }}>
                  <Form.Item
                    name={["sessions", sessionIndex, "name"]}
                    label="Tên Phiên Học"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={["sessions", sessionIndex, "description"]}
                    label="Mô Tả"
                  >
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item
                    name={["sessions", sessionIndex, "slotCount"]}
                    label="Số Buổi Học"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} />
                  </Form.Item>

                  <Title level={4}>Buổi học</Title>
                  {session.slots.map((_slot, slotIndex) => (
                    <Card
                      key={slotIndex}
                      className="mb-2"
                      style={{ background: "#fff" }}
                    >
                      <Form.Item
                        name={[
                          "sessions",
                          sessionIndex,
                          "slots",
                          slotIndex,
                          "name",
                        ]}
                        label="Tên Buổi Học"
                        rules={[{ required: true }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={[
                          "sessions",
                          sessionIndex,
                          "slots",
                          slotIndex,
                          "description",
                        ]}
                        label="Mô tả"
                      >
                        <Input.TextArea />
                      </Form.Item>
                      <Form.Item
                        name={[
                          "sessions",
                          sessionIndex,
                          "slots",
                          slotIndex,
                          "type",
                        ]}
                        label="Loại Buổi Học"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Option value="Lesson">Bài học</Option>
                          <Option value="activity">Hoạt động</Option>
                          <Option value="Prayer">Học kinh</Option>
                        </Select>
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => addSlot(sessionIndex)}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm buổi học
                  </Button>
                </Card>
              </Panel>
            ))}
          </Collapse>
          <Button
            type="dashed"
            onClick={addSession}
            block
            icon={<PlusOutlined />}
            className="mb-4 mt-4"
          >
            Thêm phiên học
          </Button>
        </>
      ),
    },
    {
      title: "Review",
      content: (
        <Card title="Xem trước giáo trình">
          <SyllabusPreview formValues={form.getFieldsValue()} grades={grades} />
        </Card>
      ),
    },
  ];

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6">
      <Title level={2}>
        <BookOutlined /> Tạo giáo trình mới
      </Title>
      <Spin spinning={loading}>
        <Steps current={currentStep}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <Divider />
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={24}>
            <Col span={previewVisible ? 16 : 24}>
              {steps[currentStep].content}
            </Col>
            {previewVisible && (
              <Col span={8}>
                <Card title="Xem trước" extra={<EyeOutlined />}>
                  <SyllabusPreview
                    formValues={form.getFieldsValue()}
                    grades={grades}
                  />
                </Card>
              </Col>
            )}
          </Row>
          <Row justify="space-between" className="mt-4">
            <Col>
              {currentStep > 0 && (
                <Button onClick={() => prev()}>Previous</Button>
              )}
            </Col>
            <Col>
              <Button
                type="primary"
                ghost
                onClick={() => setPreviewVisible(!previewVisible)}
                icon={<EyeOutlined />}
              >
                {previewVisible ? "Hide Preview" : "Show Preview"}
              </Button>
            </Col>
            <Col>
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={() => next()}>
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button type="primary" htmlType="submit">
                  Thêm giáo trình
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>
  );
};
export default AddSyllabusScreen;

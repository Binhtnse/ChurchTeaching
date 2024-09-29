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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";

const { Option } = Select;

interface Grade {
  id: number;
  name: string;
}

const AddSyllabusScreen: React.FC = () => {
  const [form] = Form.useForm();
  const [sessions, setSessions] = useState<
    Array<{ slots: Array<Record<string, unknown>> }>
  >([]);
  const { role, isLoggedIn } = useAuthState();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    name: string;
    duration: number;
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
        duration: `${values.duration} weeks`,
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

  if (!isLoggedIn || role !== "ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Syllabus</h1>
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Card className="mb-6">
            <Form.Item
              name="name"
              label="Syllabus Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="duration"
              label="Duration (weeks)"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item name="grade" label="Grade" rules={[{ required: true }]}>
              <Select>
                {grades.map((grade) => (
                  <Option key={grade.id} value={grade.id}>
                    {grade.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          <h2 className="text-xl font-semibold mb-4">Sessions</h2>
          {sessions.map((session, sessionIndex) => (
            <Card key={sessionIndex} className="mb-4">
              <h3 className="text-lg font-medium mb-2">
                Session {sessionIndex + 1}
              </h3>
              <Form.Item
                name={["sessions", sessionIndex, "name"]}
                label="Session Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["sessions", sessionIndex, "description"]}
                label="Description"
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item
                name={["sessions", sessionIndex, "slotCount"]}
                label="Number of Slots"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} />
              </Form.Item>

              <h4 className="text-base font-medium mb-2">Slots</h4>
              {session.slots.map((_slot, slotIndex) => (
                <Card key={slotIndex} className="mb-2">
                  <Form.Item
                    name={[
                      "sessions",
                      sessionIndex,
                      "slots",
                      slotIndex,
                      "name",
                    ]}
                    label="Slot Name"
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
                    label="Description"
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
                    label="Slot Type"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Option value="lesson">Lesson</Option>
                      <Option value="activity">Activity</Option>
                      <Option value="discussion">Discussion</Option>
                      {/* Add more slot type options as needed */}
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
                Add Slot
              </Button>
            </Card>
          ))}
          <Button
            type="dashed"
            onClick={addSession}
            block
            icon={<PlusOutlined />}
            className="mb-4"
          >
            Add Session
          </Button>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit Syllabus
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};
export default AddSyllabusScreen;

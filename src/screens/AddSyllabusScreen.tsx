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
  Space,
} from "antd";
import {
  PlusOutlined,
  BookOutlined,
  ScheduleOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CloudinaryUploadWidget from "../components/CloudinaryUploadWidget";
import { Modal } from "antd";
import "./AddSyllabusScreen.css";

const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;

interface Grade {
  id: number;
  name: string;
}

interface ExamIdObject {
  label: string;
  value: number;
  key: string;
}

interface GradeTemplate {
  id: number;
  name: string;
  weight: number;
  isFullSlot: string;
}

interface FormValues {
  name: string;
  duration: string;
  grade: number;
  levelName?: string;
  sessions: Array<{
    name: string;
    description: string;
    slotCount: number;
    slots: Array<{
      name: string;
      description: string;
      type: string;
      examId: number | ExamIdObject;
      examName?: string;
      sessionUnits: number;
    }>;
  }>;
}

interface Session {
  name: string;
  description: string;
  slotCount: number;
  slots: Array<{
    name: string;
    description: string;
    type: string;
    examId?: number;
    materialName?: string;
    materialLinks?: string[];
  }>;
}

const SyllabusPreview: React.FC<{
  formValues: {
    name: string;
    duration: string;
    grade: number;
    levelName?: string;
    sessions: Array<{
      name: string;
      description: string;
      slotCount: number;
      slots: Array<{
        name: string;
        description: string;
        type: string;
        examId: number | { label: string };
        examName?: string;
      }>;
    }>;
  };
  grades: Grade[];
}> = ({ formValues, grades }) => {
  console.log("Preview formValues:", formValues);
  return (
    <div className="syllabus-preview">
      <Title level={3}>{formValues.name}</Title>
      <Space direction="vertical" size="small" className="mb-4">
        <Text strong>
          Thời lượng: <Text>{formValues.duration}</Text>
        </Text>
        <Text strong>
          Khối:{" "}
          <Text>{grades.find((g) => g.id === formValues.grade)?.name}</Text>
        </Text>
      </Space>

      <Title level={4} className="mt-6 mb-4">
        Chương
      </Title>
      <List
        itemLayout="vertical"
        dataSource={formValues.sessions}
        renderItem={(session, index: number) => (
          <List.Item className="mb-6">
            <Card
              title={
                <Text strong>{`Chương ${index + 1}: ${session.name}`}</Text>
              }
              extra={<Tag color="blue">{`${session.slotCount} bài học`}</Tag>}
            >
              <Text>{session.description}</Text>
              <Divider orientation="left">Bài học</Divider>
              <List
                dataSource={session.slots}
                renderItem={(slot, slotIndex: number) => (
                  <List.Item>
                    <Space direction="vertical" size="small">
                      <Text strong>
                        {`Buổi ${slotIndex + 1}: ${
                          slot.type === "exam" ? "Kiểm tra" : slot.name
                        }`}
                      </Text>
                      <Text>{slot.description}</Text>
                      {slot.examId && (
                        <Text type="secondary">
                          Bài kiểm tra:{" "}
                          {typeof slot.examId === "object" &&
                          "label" in slot.examId
                            ? slot.examId.label
                            : ""}
                        </Text>
                      )}
                      <Tag color="green">
                        {slot.type === "Lesson"
                          ? "Bài học"
                          : slot.type === "exam"
                          ? "Kiểm tra"
                          : "Học và kiểm tra"}
                      </Tag>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
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
  const [gradeTemplates, setGradeTemplates] = useState<GradeTemplate[]>([]);
  const [selectedExams, setSelectedExams] = useState<{ [key: string]: number }>(
    {}
  );
  const [allGradeTemplates, setAllGradeTemplates] = useState<
    Array<{
      id: number;
      name: string;
      maxExamCount: number;
      exams: GradeTemplate[];
    }>
  >([]);
  const [totalSlotCount, setTotalSlotCount] = useState(0);
  console.log(totalSlotCount);
  const [currentStep, setCurrentStep] = useState(0);
  const [policies, setPolicies] = useState<
    {
      id: number;
      absenceLimit: number;
      absenceWithPermissionLimit: number;
      tuitionFee: number;
      numberOfMember: number;
    }[]
  >([]);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    duration: "",
    grade: 0,
    sessions: [],
    levelName: "",
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const navigate = useNavigate();

  const onFinish = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const currentFormValues = form.getFieldsValue(true);
      const formattedData = {
        academicYearId: Number(currentFormValues.academicYearId),
        name: currentFormValues.name,
        duration: currentFormValues.duration,
        gradeTemplateId: Number(currentFormValues.gradeTemplateId),
        levelName:
          grades.find((g) => g.id === currentFormValues.grade)?.name || "",
        levelID: Number(currentFormValues.grade),
        isCurrent: "true",
        policyId: Number(currentFormValues.policyId),
        sessions: currentFormValues.sessions
          ? currentFormValues.sessions.map(
              (session: {
                name: string;
                description: string;
                slotCount: number;
                slots: Array<{
                  materialLinks: string[];
                  name: string;
                  description: string;
                  type: string;
                  materialName: string;
                  examId: number;
                  sessionUnits: number;
                }>;
              }) => ({
                name: session.name,
                description: session.description,
                numberOfSlot: session.slotCount,
                slots: session.slots.map((slot, slotIndex) => ({
                  name: slot.name,
                  description: slot.description,
                  orderSlot: slotIndex + 1,
                  slotType: slot.type,
                  sessionUnits: slot.sessionUnits,
                  examId:
                    typeof slot.examId === "object"
                      ? Number((slot.examId as ExamIdObject).value)
                      : Number(slot.examId),
                  materialRequestDTO: {
                    name: slot.materialName || "",
                    links: slot.materialLinks || [],
                  },
                })),
              })
            )
          : [],
      };

      console.log("Syllabus object to be sent:", formattedData);

      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/syllabus",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add this header
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Tạo chương trình học thành công");
        form.resetFields();
        setSessions([]);
        navigate("/list-syllabus");
      } else {
        message.error("Tạo chương trình học thất bại");
      }
    } catch (error) {
      console.error("Error creating syllabus:", error);
      message.error("Tạo chương trình học thất bại");
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/policy",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add this header
          },
        }
      );
      if (response.data.status === "success") {
        setPolicies(response.data.data);
      } else {
        message.error("Failed to fetch policies");
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  useEffect(() => {
    const fetchGradeTemplates = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "https://sep490-backend-production.up.railway.app/api/v1/grade-template/list?page=1&size=10",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add this header
            },
          }
        );
        if (response.data.status === "success") {
          setAllGradeTemplates(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching grade templates:", error);
      }
    };

    fetchGradeTemplates();
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await axios.get(
          "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
        );
        setAcademicYears(response.data);
      } catch (error) {
        console.error("Error fetching academic years:", error);
      }
    };

    fetchAcademicYears();
  }, []);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=30",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.status === "success") {
          setGrades(response.data.data);
        } else {
          message.error("Failed to fetch grades");
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
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
      setTotalSlotCount((prev) => prev + 1);
    } else {
      message.warning(
        `Bạn không thể tạo nhiều hơn ${declaredSlotCount} bài cho chương này.`
      );
    }
  };

  const removeSession = (sessionIndex: number) => {
    const newSessions = [...sessions];
    newSessions.splice(sessionIndex, 1);
    setSessions(newSessions);

    // Also remove the session from form values
    const currentSessions = form.getFieldValue("sessions");
    currentSessions.splice(sessionIndex, 1);
    form.setFieldsValue({ sessions: currentSessions });
  };

  const handleSlotCountChange = (sessionIndex: number, newValue: number) => {
    const currentSlots = sessions[sessionIndex].slots.length;

    if (newValue < currentSlots) {
      // Remove excess slots
      const newSessions = [...sessions];
      newSessions[sessionIndex].slots = newSessions[sessionIndex].slots.slice(
        0,
        newValue
      );
      setSessions(newSessions);

      // Update form values to remove excess slots
      const currentFormValues = form.getFieldValue("sessions");
      currentFormValues[sessionIndex].slots = currentFormValues[
        sessionIndex
      ].slots.slice(0, newValue);
      form.setFieldsValue({ sessions: currentFormValues });

      // Update total slot count
      setTotalSlotCount((prev) => prev - (currentSlots - newValue));

      message.info(
        `Đã xóa ${currentSlots - newValue} bài học cuối cùng của chương này`
      );
    }
  };

  const removeSlot = (sessionIndex: number, slotIndex: number) => {
    // Get the slot key before removing the slot
    const slotKey = `${sessionIndex}-${slotIndex}`;

    // Remove slot from sessions
    const newSessions = [...sessions];
    newSessions[sessionIndex].slots.splice(slotIndex, 1);
    setSessions(newSessions);

    // Remove slot from form values
    const currentSessions = form.getFieldValue("sessions");
    currentSessions[sessionIndex].slots.splice(slotIndex, 1);
    form.setFieldsValue({ sessions: currentSessions });

    // Remove the exam from selectedExams
    setSelectedExams((prev) => {
      const newSelectedExams = { ...prev };
      delete newSelectedExams[slotKey];
      return newSelectedExams;
    });

    // Update total slot count
    setTotalSlotCount((prev) => prev - 1);
  };

  const handleTypeChange = (
    sessionIndex: number,
    slotIndex: number,
    value: string
  ) => {
    if (value === "exam") {
      // Set sessionUnits to 1 (Một buổi) when exam is selected
      form.setFieldsValue({
        sessions: {
          [sessionIndex]: {
            slots: {
              [slotIndex]: {
                sessionUnits: 1,
              },
            },
          },
        },
      });
    }
  };

  const handleGradeTemplateChange = (templateId: number) => {
    const selectedTemplate = allGradeTemplates.find((t) => t.id === templateId);
    if (selectedTemplate) {
      setGradeTemplates(selectedTemplate.exams);
    }
  };

  const steps = [
    {
      title: "Thông tin chung",
      content: (
        <Card title="Thông tin chung" className="mb-6">
          <Form.Item
            name="name"
            label="Tên Giáo Trình"
            rules={[
              { required: true, message: "Vui lòng nhập tên giáo trình" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="duration" label="Thời Lượng" initialValue="1 năm">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="grade"
            label="Khối"
            rules={[{ required: true, message: "Vui lòng chọn khối" }]}
          >
            <Select>
              {grades.map((grade) => (
                <Option key={grade.id} value={grade.id}>
                  {grade.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="academicYearId"
            label="Niên khóa"
            rules={[
              { required: true, message: "Vui lòng chọn niên khóa" },
              {
                validator: (_, value) => {
                  const selectedYear = academicYears.find(
                    (year) => year.id === value
                  );
                  if (
                    selectedYear?.timeStatus === "NOW" ||
                    selectedYear?.timeStatus === "PASS"
                  ) {
                    return Promise.reject(
                      "Chương trình không thể áp dụng cho năm học đang chọn"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select>
              {academicYears.map((year) => (
                <Option key={year.id} value={year.id}>
                  {year.year}{" "}
                  {year.timeStatus === "NOW" && (
                    <Tag color="blue" className="ml-2">
                      Hiện tại
                    </Tag>
                  )}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="gradeTemplateId"
            label="Khung kiểm tra"
            rules={[
              { required: true, message: "Vui lòng chọn khung kiểm tra" },
            ]}
          >
            <Select onChange={handleGradeTemplateChange}>
              {allGradeTemplates.map((template) => (
                <Option key={template.id} value={template.id}>
                  {template.name} ({template.maxExamCount} bài kiểm tra)
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="policyId"
            label="Quy định"
            rules={[{ required: true, message: "Vui lòng chọn quy định" }]}
          >
            <Select>
              {policies.map((policy) => (
                <Option key={policy.id} value={policy.id}>
                  {`Số buổi vắng không phép tối đa: ${policy.absenceLimit}, Số buổi vắng có phép tối đa: ${policy.absenceWithPermissionLimit}, Số thiếu nhi 1 lớp: ${policy.numberOfMember}, Học phí: ${policy.tuitionFee}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>
      ),
    },
    {
      title: "Chương",
      content: (
        <>
          <Title level={3}>
            <ScheduleOutlined /> Chương
          </Title>
          <Collapse>
            {sessions.map((session, sessionIndex) => (
              <Panel
                header={`Chương ${sessionIndex + 1}`}
                key={sessionIndex}
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSession(sessionIndex);
                    }}
                  />
                }
              >
                <Card className="mb-4" style={{ background: "#f0f2f5" }}>
                  <Form.Item
                    name={["sessions", sessionIndex, "name"]}
                    label="Tên Chương"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên chương" },
                    ]}
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
                    label="Số Bài Học"
                    rules={[
                      { required: true, message: "Vui lòng nhập số bài học" },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      onChange={(value) =>
                        handleSlotCountChange(sessionIndex, value || 0)
                      }
                    />
                  </Form.Item>
                  <Title level={4}>Bài học</Title>
                  {session.slots.map((_slot, slotIndex) => {
                    const globalSlotNumber =
                      sessions
                        .slice(0, sessionIndex)
                        .reduce((acc, s) => acc + s.slots.length, 0) +
                      slotIndex +
                      1;

                    return (
                      <Card
                        key={slotIndex}
                        className="mb-2"
                        style={{ background: "#fff" }}
                        title={`Bài học ${globalSlotNumber}`}
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeSlot(sessionIndex, slotIndex)}
                          />
                        }
                      >
                        <Form.Item
                          name={[
                            "sessions",
                            sessionIndex,
                            "slots",
                            slotIndex,
                            "type",
                          ]}
                          label="Hoạt động chính"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn loại hoạt động",
                            },
                          ]}
                        >
                          <Select
                            onChange={(value) =>
                              handleTypeChange(sessionIndex, slotIndex, value)
                            }
                          >
                            <Option value="Lesson">Bài học</Option>
                            <Option value="exam">Kiểm tra</Option>
                            <Option value="lesson_exam">Học và kiểm tra</Option>
                          </Select>
                        </Form.Item>
                        {form.getFieldValue([
                          "sessions",
                          sessionIndex,
                          "slots",
                          slotIndex,
                          "type",
                        ]) !== "exam" && (
                          <Form.Item
                            name={[
                              "sessions",
                              sessionIndex,
                              "slots",
                              slotIndex,
                              "sessionUnits",
                            ]}
                            label="Thời lượng bài học"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn thời lượng bài học",
                              },
                            ]}
                          >
                            <Select>
                              <Option value={0.5}>Nửa buổi</Option>
                              <Option value={1}>Một buổi</Option>
                            </Select>
                          </Form.Item>
                        )}
                        {form.getFieldValue([
                          "sessions",
                          sessionIndex,
                          "slots",
                          slotIndex,
                          "type",
                        ]) === "exam" ? (
                          <>
                            <Form.Item
                              name={[
                                "sessions",
                                sessionIndex,
                                "slots",
                                slotIndex,
                                "name",
                              ]}
                              label="Tên Bài Học"
                              initialValue="Kiểm tra"
                              hidden
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              name={[
                                "sessions",
                                sessionIndex,
                                "slots",
                                slotIndex,
                                "examId",
                              ]}
                              label="Chọn bài kiểm tra"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng chọn bài kiểm tra",
                                },
                              ]}
                            >
                              <Select
                                labelInValue
                                onChange={(selected) => {
                                  const slotKey = `${sessionIndex}-${slotIndex}`;
                                  const value = selected.value;
                                  setSelectedExams((prev) => ({
                                    ...prev,
                                    [slotKey]: value,
                                  }));
                                }}
                              >
                                {gradeTemplates
                                  .filter(
                                    (exam) =>
                                      exam.isFullSlot === "true" &&
                                      !Object.values(selectedExams).includes(
                                        exam.id
                                      )
                                  )
                                  .map((exam) => (
                                    <Option key={exam.id} value={exam.id}>
                                      {exam.name}
                                    </Option>
                                  ))}
                              </Select>
                            </Form.Item>
                          </>
                        ) : form.getFieldValue([
                            "sessions",
                            sessionIndex,
                            "slots",
                            slotIndex,
                            "type",
                          ]) === "lesson_exam" ? (
                          <>
                            <Form.Item
                              name={[
                                "sessions",
                                sessionIndex,
                                "slots",
                                slotIndex,
                                "name",
                              ]}
                              label="Tên Bài Học"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập tên bài học",
                                },
                              ]}
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
                                "examId",
                              ]}
                              label="Chọn bài kiểm tra"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng chọn bài kiểm tra",
                                },
                              ]}
                            >
                              <Select
                                labelInValue
                                onChange={(selected) => {
                                  const slotKey = `${sessionIndex}-${slotIndex}`;
                                  const value = selected.value;
                                  setSelectedExams((prev) => ({
                                    ...prev,
                                    [slotKey]: value,
                                  }));
                                }}
                              >
                                {gradeTemplates
                                  .filter(
                                    (exam) =>
                                      exam.isFullSlot === "false" &&
                                      !Object.values(selectedExams).includes(
                                        exam.id
                                      )
                                  )
                                  .map((exam) => (
                                    <Option key={exam.id} value={exam.id}>
                                      {exam.name}
                                    </Option>
                                  ))}
                              </Select>
                            </Form.Item>
                            <Form.Item
                              name={[
                                "sessions",
                                sessionIndex,
                                "slots",
                                slotIndex,
                                "materialName",
                              ]}
                              label="Tài Liệu"
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              name={[
                                "sessions",
                                sessionIndex,
                                "slots",
                                slotIndex,
                                "materialLinks",
                              ]}
                              label="Link tài liệu"
                            >
                              <CloudinaryUploadWidget
                                onUploadSuccess={(info: unknown) => {
                                  const uploadInfo = info as {
                                    secure_url: string;
                                    original_filename: string;
                                  };
                                  const currentLinks =
                                    form.getFieldValue([
                                      "sessions",
                                      sessionIndex,
                                      "slots",
                                      slotIndex,
                                      "materialLinks",
                                    ]) || [];
                                  form.setFieldsValue({
                                    sessions: {
                                      [sessionIndex]: {
                                        slots: {
                                          [slotIndex]: {
                                            materialLinks: [
                                              ...currentLinks,
                                              uploadInfo.secure_url,
                                            ],
                                          },
                                        },
                                      },
                                    },
                                  });
                                  message.success(
                                    `Tải file "${uploadInfo.original_filename}" thành công`
                                  );
                                }}
                                onUploadFailure={(error) => {
                                  console.error("Upload failed:", error);
                                  message.error("Tải file lên thất bại");
                                }}
                              />
                              {(
                                form.getFieldValue([
                                  "sessions",
                                  sessionIndex,
                                  "slots",
                                  slotIndex,
                                  "materialLinks",
                                ]) || []
                              ).length > 0 && (
                                <List
                                  size="small"
                                  dataSource={
                                    form.getFieldValue([
                                      "sessions",
                                      sessionIndex,
                                      "slots",
                                      slotIndex,
                                      "materialLinks",
                                    ]) || []
                                  }
                                  renderItem={(link: string, index: number) => (
                                    <List.Item
                                      actions={[
                                        <Button
                                          type="link"
                                          danger
                                          onClick={() => {
                                            const currentLinks =
                                              form.getFieldValue([
                                                "sessions",
                                                sessionIndex,
                                                "slots",
                                                slotIndex,
                                                "materialLinks",
                                              ]) || [];
                                            const newLinks =
                                              currentLinks.filter(
                                                (_: string, i: number) =>
                                                  i !== index
                                              );
                                            form.setFieldsValue({
                                              sessions: {
                                                [sessionIndex]: {
                                                  slots: {
                                                    [slotIndex]: {
                                                      materialLinks: newLinks,
                                                    },
                                                  },
                                                },
                                              },
                                            });
                                          }}
                                        >
                                          Xóa
                                        </Button>,
                                      ]}
                                    >
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Tài liệu {index + 1}
                                      </a>
                                    </List.Item>
                                  )}
                                />
                              )}
                            </Form.Item>
                          </>
                        ) : (
                          <>
                            <Form.Item
                              name={[
                                "sessions",
                                sessionIndex,
                                "slots",
                                slotIndex,
                                "name",
                              ]}
                              label="Tên Bài Học"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập tên bài học",
                                },
                              ]}
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
                                "materialName",
                              ]}
                              label="Tài Liệu"
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              name={[
                                "sessions",
                                sessionIndex,
                                "slots",
                                slotIndex,
                                "materialLinks",
                              ]}
                              label="Link tài liệu"
                            >
                              <CloudinaryUploadWidget
                                onUploadSuccess={(info: unknown) => {
                                  const uploadInfo = info as {
                                    secure_url: string;
                                    original_filename: string;
                                  };
                                  const currentLinks =
                                    form.getFieldValue([
                                      "sessions",
                                      sessionIndex,
                                      "slots",
                                      slotIndex,
                                      "materialLinks",
                                    ]) || [];
                                  form.setFieldsValue({
                                    sessions: {
                                      [sessionIndex]: {
                                        slots: {
                                          [slotIndex]: {
                                            materialLinks: [
                                              ...currentLinks,
                                              uploadInfo.secure_url,
                                            ],
                                          },
                                        },
                                      },
                                    },
                                  });
                                  message.success(
                                    `Tải file "${uploadInfo.original_filename}" thành công`
                                  );
                                }}
                                onUploadFailure={(error) => {
                                  console.error("Upload failed:", error);
                                  message.error("Tải file lên thất bại");
                                }}
                              />
                              {(
                                form.getFieldValue([
                                  "sessions",
                                  sessionIndex,
                                  "slots",
                                  slotIndex,
                                  "materialLinks",
                                ]) || []
                              ).length > 0 && (
                                <List
                                  size="small"
                                  dataSource={
                                    form.getFieldValue([
                                      "sessions",
                                      sessionIndex,
                                      "slots",
                                      slotIndex,
                                      "materialLinks",
                                    ]) || []
                                  }
                                  renderItem={(link: string, index: number) => (
                                    <List.Item
                                      actions={[
                                        <Button
                                          type="link"
                                          danger
                                          onClick={() => {
                                            const currentLinks =
                                              form.getFieldValue([
                                                "sessions",
                                                sessionIndex,
                                                "slots",
                                                slotIndex,
                                                "materialLinks",
                                              ]) || [];
                                            const newLinks =
                                              currentLinks.filter(
                                                (_: string, i: number) =>
                                                  i !== index
                                              );
                                            form.setFieldsValue({
                                              sessions: {
                                                [sessionIndex]: {
                                                  slots: {
                                                    [slotIndex]: {
                                                      materialLinks: newLinks,
                                                    },
                                                  },
                                                },
                                              },
                                            });
                                          }}
                                        >
                                          Xóa
                                        </Button>,
                                      ]}
                                    >
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Tài liệu {index + 1}
                                      </a>
                                    </List.Item>
                                  )}
                                />
                              )}
                            </Form.Item>
                          </>
                        )}
                      </Card>
                    );
                  })}{" "}
                  <Button
                    type="dashed"
                    onClick={() => addSlot(sessionIndex)}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm bài học
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
            Thêm chương
          </Button>
        </>
      ),
    },
    {
      title: "Review",
      content: (
        <Card title="Xem trước giáo trình">
          <SyllabusPreview formValues={formValues} grades={grades} />
        </Card>
      ),
    },
  ];

  const checkSyllabusExists = async (gradeId: number, yearId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/syllabus/check?gradeId=${gradeId}&yearId=${yearId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add this header
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking syllabus:", error);
      throw error;
    }
  };

  const next = () => {
    form
      .validateFields()
      .then(async (values) => {
        // Only check on first step
        if (currentStep === 0) {
          try {
            const checkResult = await checkSyllabusExists(
              values.grade,
              values.academicYearId
            );

            if (checkResult.data[0] === "false") {
              Modal.confirm({
                title: "Xác nhận",
                content: checkResult.data[1],
                okText: "Tiếp tục",
                cancelText: "Hủy",
                onOk: () => {
                  const currentValues = form.getFieldsValue(true);
                  setFormValues(currentValues);
                  setCurrentStep(currentStep + 1);
                },
              });
              return;
            }
          } catch (error) {
            console.log(error);
            message.error("Không thể kiểm tra thông tin chương trình học");
            return;
          }
        }

        // Rest of your existing next() logic
        if (currentStep === 1) {
          const selectedExamValues = Object.values(selectedExams);
          const totalRequiredExams = gradeTemplates.length;

          if (selectedExamValues.length < totalRequiredExams) {
            message.error(
              `Vui lòng sử dụng tất cả ${totalRequiredExams} bài kiểm tra trong mẫu`
            );
            return;
          }

          const uniqueExams = new Set(Object.values(selectedExams));
          if (uniqueExams.size !== selectedExamValues.length) {
            message.error("Không được chọn trùng bài kiểm tra");
            return;
          }
        }
        const currentValues = form.getFieldsValue(true);
        setFormValues(currentValues);
        setCurrentStep(currentStep + 1);

        // Your existing validation logic for step 1

        const updatedValues = {
          ...values,
          levelName: grades.find((g) => g.id === values.grade)?.name,
          sessions: values.sessions?.map((session: Session) => ({
            ...session,
            slots: session.slots?.map((slot) => ({
              ...slot,
              examName: slot.examId
                ? gradeTemplates.find((t) => t.id === slot.examId)?.name
                : undefined,
            })),
          })),
        };

        setFormValues(updatedValues);
        setCurrentStep(currentStep + 1);
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      });
  };

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      const values = form.getFieldsValue(true);
      const enrichedValues = {
        ...values,
        levelName: grades.find((g) => g.id === values.grade)?.name,
        sessions: values.sessions?.map((session: Session) => ({
          ...session,
          slots: session.slots?.map((slot) => ({
            ...slot,
            examName: slot.examId
              ? gradeTemplates.find((t) => t.id === slot.examId)?.name
              : undefined,
          })),
        })),
      };
      setFormValues(enrichedValues);
    }
  }, [currentStep, form, grades, gradeTemplates, steps.length]);

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  useEffect(() => {
    const currentValues = form.getFieldsValue();
    setFormValues({
      name: currentValues.name || "",
      duration: currentValues.duration || "",
      grade: currentValues.grade || 0,
      sessions: currentValues.sessions || [],
    });
  }, [form]);

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
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={(_, allValues) => {
            setFormValues(allValues);
          }}
        >
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
                <Button onClick={() => prev()}>Quay lại</Button>
              )}
            </Col>
            <Col>
              <Button
                type="primary"
                ghost
                onClick={() => setPreviewVisible(!previewVisible)}
                icon={<EyeOutlined />}
              >
                {previewVisible ? "Ẩn xem trước" : "Hiện xem trước"}
              </Button>
            </Col>
            <Col>
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={() => next()}>
                  Tiếp theo
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

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
} from "@ant-design/icons";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CloudinaryUploadWidget from "../components/CloudinaryUploadWidget";
import './AddSyllabusScreen.css';

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
      slots: Array<{ name: string; description: string; type: string; examId: number | { label: string }; examName?: string; }>;
    }>;
  };
  grades: Grade[];
}> = ({ formValues, grades }) => {
  console.log('Preview formValues:', formValues);
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
              extra={<Tag color="blue">{`${session.slotCount} buổi học`}</Tag>}
            >
              <Text>{session.description}</Text>
              <Divider orientation="left">Buổi học</Divider>
              <List
                dataSource={session.slots}
                renderItem={(slot, slotIndex: number) => (
                  <List.Item>
                    <Space direction="vertical" size="small">
                      <Text strong>
                        {`Buổi ${slotIndex + 1}: ${slot.type === 'exam' ? 'Kiểm tra' : slot.name}`}
                      </Text>
                      <Text>{slot.description}</Text>
                      {slot.examId && (
                        <Text type="secondary">Bài kiểm tra:  {typeof slot.examId === 'object' && 'label' in slot.examId ? slot.examId.label : ''}</Text>
                      )}
                      <Tag color="green">
                        {slot.type === 'Lesson' ? 'Bài học' :
                          slot.type === 'exam' ? 'Kiểm tra' :
                            'Học và kiểm tra'}
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
  const [selectedExams, setSelectedExams] = useState<{ [key: string]: number }>({});
  const [totalSlotCount, setTotalSlotCount] = useState(0);
  console.log(totalSlotCount)
  const [currentStep, setCurrentStep] = useState(0);
  const [policies, setPolicies] = useState<
    { id: number; absenceLimit: number; absenceWithPermissionLimit: number }[]
  >([]);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    duration: '',
    grade: 0,
    sessions: [],
    levelName: ''
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const navigate = useNavigate();

  const onFinish = async () => {
    setLoading(true);
    try {
      const currentFormValues = form.getFieldsValue(true);
      const formattedData = {
        academicYearId: currentFormValues.academicYearId,
        name: currentFormValues.name,
        duration: currentFormValues.duration,
        levelName: grades.find((g) => g.id === currentFormValues.grade)?.name || "",
        levelID: currentFormValues.grade,
        isCurrent: "true",
        policyId: currentFormValues.policyId,
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
                examId: typeof slot.examId === 'object' ? (slot.examId as ExamIdObject).value : slot.examId,
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
        formattedData
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Tạo chương trình học thành công");
        form.resetFields();
        setSessions([]);
        navigate("/list-syllabus");
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

  const fetchPolicies = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/policy"
      );
      if (response.data.status === "success") {
        setPolicies(response.data.data);
      } else {
        message.error("Failed to fetch policies");
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
      message.error("An error occurred while fetching policies");
    }
  };

  useEffect(() => {
    const fetchGradeTemplates = async () => {
      try {
        const response = await axios.get(
          'https://sep490-backend-production.up.railway.app/api/v1/grade-template/list?page=1&size=10'
        );
        if (response.data.status === 'success') {
          setGradeTemplates(response.data.data[0].exams);
        }
      } catch (error) {
        console.error('Error fetching grade templates:', error);
        message.error('Failed to fetch grade templates');
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
        message.error("Failed to fetch academic years");
      }
    };

    fetchAcademicYears();
  }, []);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=10",
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
      setTotalSlotCount(prev => prev + 1);
    } else {
      message.warning(
        `Bạn không thể tạo nhiều hơn ${declaredSlotCount} bài cho chương này.`
      );
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
          <Form.Item
            name="academicYearId"
            label="Niên khóa"
            rules={[
              { required: true },
              {
                validator: (_, value) => {
                  const selectedYear = academicYears.find(year => year.id === value);
                  if (selectedYear?.timeStatus === 'NOW') {
                    return Promise.reject('Chương trình này chỉ có thể áp dụng cho năm học sau');
                  }
                  return Promise.resolve();
                }
              }
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
            name="policyId"
            label="Quy định"
            rules={[{ required: true }]}
          >
            <Select>
              {policies.map((policy) => (
                <Option key={policy.id} value={policy.id}>
                  {`Số buổi vắng không phép tối đa: ${policy.absenceLimit}, Số buổi vắng có phép tối đa: ${policy.absenceWithPermissionLimit}`}
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
              <Panel header={`Chương ${sessionIndex + 1}`} key={sessionIndex}>
                <Card className="mb-4" style={{ background: "#f0f2f5" }}>
                  <Form.Item
                    name={["sessions", sessionIndex, "name"]}
                    label="Tên Chương"
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
                    label="Số Bài Học"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} />
                  </Form.Item>
                  <Title level={4}>Bài học</Title>
                  {session.slots.map((_slot, slotIndex) => {
                    const globalSlotNumber = sessions
                      .slice(0, sessionIndex)
                      .reduce((acc, s) => acc + s.slots.length, 0) + slotIndex + 1;

                    return (
                      <Card
                        key={slotIndex}
                        className="mb-2"
                        style={{ background: "#fff" }}
                        title={`Bài học ${globalSlotNumber}`}
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
                          rules={[{ required: true }]}
                        >
                          <Select>
                            <Option value="Lesson">Bài học</Option>
                            <Option value="exam">Kiểm tra</Option>
                            <Option value="lesson_and_exam">Học và kiểm tra</Option>
                          </Select>
                        </Form.Item>
                        {form.getFieldValue([
                          "sessions",
                          sessionIndex,
                          "slots",
                          slotIndex,
                          "type"
                        ]) === "exam" ? (
                          <Form.Item
                            name={[
                              "sessions",
                              sessionIndex,
                              "slots",
                              slotIndex,
                              "examId"
                            ]}
                            label="Chọn bài kiểm tra"
                            rules={[{ required: true }]}
                          >
                            <Select
                              labelInValue
                              onChange={(selected) => {
                                const slotKey = `${sessionIndex}-${slotIndex}`;
                                const value = selected.value;
                                setSelectedExams(prev => ({
                                  ...prev,
                                  [slotKey]: value
                                }));
                              }}
                            >
                              {gradeTemplates
                                .filter((exam) => exam.isFullSlot === "true" && !Object.values(selectedExams).includes(exam.id))
                                .map((exam) => (
                                  <Option key={exam.id} value={exam.id}>
                                    {exam.name}
                                  </Option>
                                ))}
                            </Select>
                          </Form.Item>
                        ) : form.getFieldValue([
                          "sessions",
                          sessionIndex,
                          "slots",
                          slotIndex,
                          "type"
                        ]) === "lesson_and_exam" ? (
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
                                "examId"
                              ]}
                              label="Chọn bài kiểm tra"
                              rules={[{ required: true }]}
                            >
                              <Select
                                labelInValue
                                onChange={(selected) => {
                                  const slotKey = `${sessionIndex}-${slotIndex}`;
                                  const value = selected.value;
                                  setSelectedExams(prev => ({
                                    ...prev,
                                    [slotKey]: value
                                  }));
                                }}
                              >
                                {gradeTemplates
                                  .filter((exam) => exam.isFullSlot === "false" && !Object.values(selectedExams).includes(exam.id))
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
                            </Form.Item>
                          </>
                        )}
                      </Card>
                    )
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

  const next = () => {
    form.validateFields()
      .then((values) => {
        const currentValues = form.getFieldsValue(true);
        setFormValues(currentValues);
        setCurrentStep(currentStep + 1);
        console.log("Current Form Values:", values);
        console.log("Enriched Form Values:", {
          ...values,
          levelName: grades.find(g => g.id === values.grade)?.name,
          sessions: values.sessions?.map((session: Session) => ({
            ...session,
            slots: session.slots?.map(slot => ({
              ...slot,
              examName: slot.examId ? gradeTemplates.find(t => t.id === slot.examId)?.name : undefined
            }))
          }))
        });
        if (currentStep === 1) {
          const selectedExamValues = Object.values(selectedExams);
          const totalRequiredExams = gradeTemplates.length;

          if (selectedExamValues.length < totalRequiredExams) {
            message.error(`Vui lòng sử dụng tất cả ${totalRequiredExams} bài kiểm tra trong mẫu`);
            return;
          }

          const uniqueExams = new Set(Object.values(selectedExams));
          if (uniqueExams.size !== selectedExamValues.length) {
            message.error('Không được chọn trùng bài kiểm tra');
            return;
          }
        }

        const updatedValues = {
          ...values,
          levelName: grades.find(g => g.id === values.grade)?.name,
          sessions: values.sessions?.map((session: Session) => ({
            ...session,
            slots: session.slots?.map(slot => ({
              ...slot,
              examName: slot.examId ? gradeTemplates.find(t => t.id === slot.examId)?.name : undefined
            }))
          }))
        };

        setFormValues(updatedValues);
        setCurrentStep(currentStep + 1);
      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      });
  };

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      const values = form.getFieldsValue(true);
      const enrichedValues = {
        ...values,
        levelName: grades.find(g => g.id === values.grade)?.name,
        sessions: values.sessions?.map((session: Session) => ({
          ...session,
          slots: session.slots?.map(slot => ({
            ...slot,
            examName: slot.examId ? gradeTemplates.find(t => t.id === slot.examId)?.name : undefined
          }))
        }))
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
      name: currentValues.name || '',
      duration: currentValues.duration || '',
      grade: currentValues.grade || 0,
      sessions: currentValues.sessions || []
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

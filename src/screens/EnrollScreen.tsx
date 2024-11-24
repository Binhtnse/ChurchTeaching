import React, { useState, useEffect, startTransition } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Upload,
  UploadFile,
  message,
  DatePicker,
  Spin,
} from "antd";
import axios from "axios";
import { UploadOutlined } from "@ant-design/icons";
import EnrollResultScreen from "./EnrollResultScreen";
import { useAuthState } from "../hooks/useAuthState";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import usePageTitle from "../hooks/usePageTitle";

const { Option } = Select;
dayjs.extend(customParseFormat);

interface Question {
  questionId: number;
  questionText: string;
  questionType: string;
  options: { optionId: number; optionText: string }[] | null;
}

interface SurveyData {
  surveyId: number;
  surveyTitle: string;
  questions: Question[];
}

interface Major {
  id: number;
  name: string;
}

interface Grade {
  id: number;
  name: string;
  age: number;
  level: string;
  description: string;
  syllabusName: string;
  major: {
    id: number;
    name: string;
    ageRange: string;
    description: string;
  };
}

interface ChildData {
  [key: string]: unknown;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const EnrollScreen: React.FC = () => {
  const { isLoggedIn, role } = useAuthState();
  const [form] = Form.useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedChildName, setSubmittedChildName] = useState("");
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<number | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [childrenData, setChildrenData] = useState<ChildData[]>([{}]);
  const [isSurveyLoading, setIsSurveyLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [fileList, setFileList] = useState<unknown[]>([]);
  const [parentInfo, setParentInfo] = useState<{ [key: number]: unknown }>({});
  const [uploadedUrls, setUploadedUrls] = useState<{ [key: number]: string[] }>({});
  const [groupData, setGroupData] = useState<{ [key: string]: unknown }>({});
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Đơn đăng ký học", "#4154f1");
  }, [setPageTitle]);

  const questionGroups = [
    { title: "Thông tin phụ huynh", questions: [1, 2, 3, 4, 5, 6] },
    {
      title: "Thông tin thiếu nhi",
      fields: ["major", "gradeId"],
      questions: [7, 8, 9, 10],
    },
    {
      title: "Thông tin liên quan khác",
      fields: ["image"],
      questions: [11, 12, 13, 14, 15, 16],
    },
  ];

  const uploadToCloudinary = async (file: File) => {
    const CLOUD_NAME = "dlhd1ztab";
    const PRESET_NAME = "qtsuml94";
    const FOLDER_NAME = "do an";
    const api = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", PRESET_NAME);
    formData.append("folder", FOLDER_NAME);

    try {
      const response = await axios.post(api, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.secure_url;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const handleChange = ({ fileList: newFileList }: { fileList: unknown[] }) => {
    setFileList(newFileList);
  };

  const renderQuestionGroup = (groupIndex: number, childIndex: number) => {
    const group = questionGroups[groupIndex];
    return (
      <>
        {childIndex > 0 && groupIndex === 0 ? null : (
          <>
            <h3 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b border-blue-300">
              {group.title} {childIndex > 0 ? `(Child ${childIndex + 1})` : ""}
            </h3>
            {group.fields?.includes("major") && (
              <Form.Item
                name="major"
                label="Ngành thiếu nhi muốn đăng ký"
                rules={[{ required: true, message: "Vui lòng chọn ngành" }]}
              >
                <Select onChange={handleMajorChange}>
                  {majors.map((major) => (
                    <Option key={major.id} value={major.id}>
                      {major.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {group.fields?.includes("gradeId") && (
              <Form.Item
                name="gradeId"
                label="Khối thiếu nhi muốn đăng ký"
                rules={[{ required: true, message: "Vui lòng chọn khối" }]}
              >
                <Select onChange={handleGradeChange}>
                  {grades.map((grade) => (
                    <Option key={grade.id} value={grade.id}>
                      {`${grade.name} - ${grade.level} (${grade.age} tuổi)`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {group.questions.map((questionId) => {
              const question = surveyData?.questions.find(
                (q) => q.questionId === questionId
              );
              if (!question) return null;
              if (
                (selectedMajor === 1 || selectedMajor === 2) &&
                questionId >= 13
              ) {
                return null;
              }
              if (selectedMajor === 3 && questionId >= 15) {
                return null;
              }
              return (
                <Form.Item
                  key={question.questionId}
                  name={question.questionId}
                  label={question.questionText}
                  rules={[
                    ...(groupIndex !== 2
                      ? [
                          {
                            required: true,
                            message: `Vui lòng trả lời câu hỏi này!`,
                          },
                          ...(question.questionId === 6 ? [
                            {
                              pattern: /^[0-9]{10}$/,
                              message: 'Số điện thoại phải có 10 chữ số!'
                            }
                          ] : []),
                          ...(question.questionId === 5 ? [
                            {
                              type: 'email' as const,
                              message: 'Vui lòng nhập đúng định dạng email!'
                            }
                          ] : [])
                        ]
                      : [])
                  ]}
                >
                  {question.questionId === 9 ||
                    question.questionId === 11 ||
                    question.questionId === 13 ||
                    question.questionId === 15 ? (
                    <DatePicker
                      format="DD-MM-YYYY"
                      onChange={(date) => {
                        form.setFieldsValue({
                          [question.questionId]: date,
                        });
                      }}
                    />
                  ) : question.questionType === "text" ? (
                    <Input {...(question.questionId === 6 ? {
                      maxLength: 10,
                      onKeyPress: (e) => {
                        const isNumber = /[0-9]/.test(e.key);
                        if (!isNumber) {
                          e.preventDefault();
                        }
                      }
                    } : {})}/>
                  ) : (
                    <Select placeholder="Chọn một lựa chọn">
                      {question.options?.map((option) => (
                        <Option key={option.optionId} value={option.optionId}>
                          {option.optionText}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              );
            })}
            {group.fields?.includes("image") && (
              <Form.Item
                name="image"
                label="Hình ảnh bằng chứng"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e && e.fileList;
                }}
              >
                <Upload
                  name="image"
                  listType="text"
                  multiple={true}
                  fileList={fileList as UploadFile[]}
                  onChange={handleChange}
                  beforeUpload={(file) => {
                    const isJpgOrPng =
                      file.type === "image/jpeg" || file.type === "image/png";
                    if (!isJpgOrPng) {
                      message.error("You can only upload JPG/PNG file!");
                    }
                    const isLt2M = file.size / 1024 / 1024 < 2;
                    if (!isLt2M) {
                      message.error("Image must smaller than 2MB!");
                    }
                    return isJpgOrPng && isLt2M;
                  }}
                  customRequest={async ({ file, onSuccess }) => {
                    try {
                      const secureUrl = await uploadToCloudinary(file as File);
                      if (onSuccess) {
                        onSuccess(secureUrl);
                      }
                      setUploadedUrls(prev => ({
                        ...prev,
                        [childrenData.length - 1]: [...(prev[childrenData.length - 1] || []), secureUrl]
                      }));
                    } catch (error) {
                      console.error("Upload failed:", error);
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />}>Tải hình ảnh lên</Button>
                </Upload>
              </Form.Item>
            )}
          </>
        )}
      </>
    );
  };

  const addAnotherChild = () => {
    const currentChildData = form.getFieldsValue();
    setChildrenData((prevData) => [...prevData, currentChildData]);
    setCurrentGroup(1);
    setFileList([]); // Reset file list for new child
    form.resetFields();
    form.setFieldsValue(parentInfo);
  };

  const nextGroup = () => {
    form
      .validateFields()
      .then((values) => {
        if (currentGroup === 0) {
          setParentInfo({
            1: values[1],
            2: values[2],
            3: values[3],
            4: values[4],
            5: values[5],
            6: values[6],
          });
        }
        setChildrenData((prevData) => {
          const newData = [...prevData];
          newData[newData.length - 1] = {
            ...newData[newData.length - 1],
            ...values,
          };
          return newData;
        });
        setCurrentGroup(currentGroup + 1);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  const prevGroup = () => {
    const currentValues = form.getFieldsValue();
    setGroupData((prevData) => ({ ...prevData, ...currentValues }));
    setCurrentGroup(currentGroup - 1);
  };

  useEffect(() => {
    form.setFieldsValue(groupData);
  }, [currentGroup, form, groupData]);

  useEffect(() => {
    if (isLoggedIn || role === "GUEST") {
      fetchSurveyData();
      fetchMajors();
    }
  }, [isLoggedIn, role]);

  const fetchSurveyData = async () => {
    setIsSurveyLoading(true);
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/survey/1"
      );
      startTransition(() => {
        setSurveyData(response.data.data);
        setIsSurveyLoading(false);
      });
    } catch (error) {
      console.error("Error fetching survey data:", error);
      setIsSurveyLoading(false);
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/major?page=0&size=10"
      );
      setMajors(response.data.data.content);
    } catch (error) {
      console.error("Error fetching majors:", error);
    }
  };

  const fetchGrades = async (majorId: number) => {
    try {
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/grade/${majorId}`
      );
      if (
        response.data &&
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        setGrades(response.data.data);
      } else {
        console.error("Unexpected response structure:", response.data);
        setGrades([]);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      setGrades([]);
    }
  };

  const handleMajorChange = (value: number) => {
    console.log(`Selected major ID: ${value}`);
    setSelectedMajor(value);
    fetchGrades(value);
  };

  const handleGradeChange = (value: number) => {
    console.log(`Selected grade ID: ${value}`);
    form.setFieldsValue({ gradeId: value });
  };

  const onFinish = async (values: { [key: string]: unknown }) => {
    setLoading(true);
    const finalChildData = [
      ...childrenData.slice(0, -1),
      { ...childrenData[childrenData.length - 1], ...values },
    ];

    const requestBody = finalChildData.map((childData, index) => ({
      surveyId: 1,
      note: childData.note || "Đây là thông tin thêm cho khảo sát này.",
      gradeId: childData.gradeId as number,
      answers: surveyData?.questions.map((question) => {
        const answer =
          question.questionId <= 6
            ? parentInfo[question.questionId]
            : childData[question.questionId];
        let formattedAnswer = answer;
        if ([9, 11, 13, 15].includes(question.questionId)) {
          formattedAnswer = answer
            ? dayjs(answer as Dayjs).format("DD-MM-YYYY")
            : null;
        }
        return {
          questionId: question.questionId,
          answerType: question.questionType,
          answerText:
            formattedAnswer !== undefined ? String(formattedAnswer) : null,
          status: "ACTIVE",
          selectedOptions:
            question.questionType === "choice" ? [formattedAnswer] : [],
        };
      }),
      links: uploadedUrls[index] || [],
    }));

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    try {
      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/register-infor",
        requestBody
      );
      console.log("Registration successful:", response.data);
      setSubmittedChildName(values["childname"] as string);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting registration:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onFinish({ ...groupData, ...values });
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  if (isSubmitted) {
    return <EnrollResultScreen childName={submittedChildName} />;
  }

  if (isSurveyLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!surveyData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="max-w-2xl mx-auto p-6">
        <Form
          {...formItemLayout}
          form={form}
          name="register"
          labelWrap
          labelAlign="left"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
          scrollToFirstError
        >
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-6 pb-3 border-b-2 border-blue-500 whitespace-nowrap">
            Bảng điền thông tin phụ huynh và thiếu nhi
          </h1>
          {renderQuestionGroup(currentGroup, 0)}
          <Form.Item>
            {currentGroup > 0 && <Button onClick={prevGroup}>Quay lại</Button>}
            {currentGroup < questionGroups.length - 1 && (
              <Button onClick={nextGroup}>Tiếp theo</Button>
            )}
            {currentGroup === questionGroups.length - 1 && (
              <>
                <Button onClick={addAnotherChild}>
                  Đăng ký thêm thiếu nhi
                </Button>
                <Button type="primary" onClick={handleSubmit} loading={loading}>
                  Đăng ký
                </Button>
              </>
            )}
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
export default EnrollScreen;

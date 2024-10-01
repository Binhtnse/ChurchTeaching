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
  const [isSurveyLoading, setIsSurveyLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [fileList, setFileList] = useState<unknown[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
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

  const renderQuestionGroup = (groupIndex: number) => {
    const group = questionGroups[groupIndex];
    return (
      <>
        <h3 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b border-blue-300">
          {group.title}
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
          if ((selectedMajor === 1 || selectedMajor === 2) && questionId >= 13) {
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
                // Remove required rule for the "Thông tin liên quan khác" group
                ...(groupIndex !== 2
                  ? [
                      {
                        required: true,
                        message: `Vui lòng trả lời câu hỏi này!`,
                      },
                    ]
                  : []),
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
                <Input />
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
                  setUploadedUrls((prevUrls) => [...prevUrls, secureUrl]);
                } catch (error) {
                  console.error("Upload failed:", error);
                }
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Images</Button>
            </Upload>
          </Form.Item>
        )}
      </>
    );
  };

  const nextGroup = () => {
    form
      .validateFields()
      .then((values) => {
        setGroupData((prevData) => ({ ...prevData, ...values }));
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
    console.log("Form values before processing: ", values);
    const allData = { ...groupData, ...values };
    console.log("All form data:", allData);

    const requestBody = {
      surveyId: 1,
      note: allData.note || "Đây là thông tin thêm cho khảo sát này.",
      gradeId: allData.gradeId as number,
      answers: surveyData?.questions.map((question) => {
        const answer = allData[question.questionId];
        let formattedAnswer = answer;
        if (
          question.questionId === 9 ||
          question.questionId === 11 ||
          question.questionId === 13 ||
          question.questionId === 15
        ) {
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
      links: uploadedUrls,
    };

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
      // Handle error (e.g., show error message to user)
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
    return <div>Loading survey data...</div>;
  }

  if (!surveyData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginLeft: "256px", padding: "20px" }}>
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
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-6 pb-3 border-b-2 border-blue-500">
            Bảng điền thông tin phụ huynh và thiếu nhi
          </h1>
          {renderQuestionGroup(currentGroup)}
          <Form.Item>
            {currentGroup > 0 && <Button onClick={prevGroup}>Quay lại</Button>}
            {currentGroup < questionGroups.length - 1 && (
              <Button onClick={nextGroup}>Tiếp theo</Button>
            )}
            {currentGroup === questionGroups.length - 1 && (
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                Đăng ký
              </Button>
            )}
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
export default EnrollScreen;

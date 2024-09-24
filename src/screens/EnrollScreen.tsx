import React, { useState, useEffect, startTransition } from "react";
import { Button, Form, Input, Select, Upload, message } from "antd";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import EnrollResultScreen from "./EnrollResultScreen";
import { useAuthState } from "../hooks/useAuthState";
import { AdvancedImage } from "@cloudinary/react";
import { fill } from "@cloudinary/url-gen/actions/resize";
import cld from "../utils/Cloudinary";

const { Option } = Select;

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
  description: string | null;
  status: string;
  major: {
    id: number;
    name: string;
    description: string | null;
    status: string;
  };
  createdBy: string | null;
  createdDate: string | null;
  lastModifiedBy: string | null;
  lastModifiedDate: string | null;
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
  const [grades, setGrades] = useState<Grade[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSurveyLoading, setIsSurveyLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState(0);

  const questionGroups = [
    { title: "Thông tin phụ huynh", questions: [1, 2, 3, 4, 5, 6] },
    {
      title: "Thông tin thiếu nhi",
      fields: ["major", "grade"],
      questions: [7, 8, 9, 11, 12, 19],
    },
    {
      title: "Thông tin liên quan khác",
      fields: ["image"],
      questions: [10, 13, 14, 15, 16, 17, 18],
    },
  ];

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
        {group.fields?.includes("grade") && (
          <Form.Item
            name="grade"
            label="Khối thiếu nhi muốn đăng ký"
            rules={[{ required: true, message: "Vui lòng chọn khối" }]}
          >
            <Select onChange={handleGradeChange}>
              {grades.map((grade) => (
                <Option key={grade.id} value={grade.id}>
                  {grade.name}
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
          return (
            <Form.Item
              key={question.questionId}
              name={question.questionId}
              label={question.questionText}
              rules={[
                { required: true, message: `Vui lòng trả lời câu hỏi này!` },
              ]}
            >
              {/* Render input based on question type */}
              {question.questionType === "text" ? (
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
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
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
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", "ml_default");

                try {
                  const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/dlhd1ztab/image/upload`,
                    formData
                  );
                  if (onSuccess) {
                    onSuccess(response.data.public_id);
                  }
                  setImageUrl(response.data.public_id);
                } catch (error) {
                  console.error("Upload failed:", error);
                }
              }}
            >
              {imageUrl ? (
                <AdvancedImage
                  cldImg={cld
                    .image(imageUrl)
                    .resize(fill().width(100).height(100))}
                />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        )}
      </>
    );
  };

  const nextGroup = () => {
    form
      .validateFields(questionGroups[currentGroup].questions)
      .then(() => {
        setCurrentGroup(currentGroup + 1);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  const prevGroup = () => {
    setCurrentGroup(currentGroup - 1);
  };

  useEffect(() => {
    if (isLoggedIn || role === "GUEST") {
      fetchSurveyData();
      fetchMajors();
      fetchGrades();
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

  const fetchGrades = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/grade?page=0&size=10"
      );
      if (
        response.data &&
        response.data.data &&
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
  };

  const handleGradeChange = (value: number) => {
    console.log(`Selected grade ID: ${value}`);
  };

  const onFinish = async (values: { [key: string]: unknown }) => {
    setLoading(true);
    console.log("Received values of form: ", values);

    const requestBody = {
      surveyId: 1,
      note: values.note || "Đây là thông tin thêm cho khảo sát này.",
      gradeId: values.grade,
      answers: surveyData?.questions.map((question) => ({
        questionId: question.questionId,
        answerType: question.questionType,
        answerText:
          question.questionType === "text" ? values[question.questionId] : null,
        status: "ACTIVE", // You may want to adjust this based on your requirements
        selectedOptions:
          question.questionType === "choice"
            ? [values[question.questionId]]
            : [],
      })),
      links:
        values.image && Array.isArray(values.image) && values.image.length > 0
          ? [values.image[0]]
          : [],
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
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
          scrollToFirstError
        >
          <h1 className="text-3xl font-bold text-blue-500 text-center mb-6 pb-3 border-b-2 border-blue-500">
            {surveyData.surveyTitle}
          </h1>
          {renderQuestionGroup(currentGroup)}
          <Form.Item>
            {currentGroup > 0 && <Button onClick={prevGroup}>Quay lại</Button>}
            {currentGroup < questionGroups.length - 1 && (
              <Button onClick={nextGroup}>Tiếp theo</Button>
            )}
            {currentGroup === questionGroups.length - 1 && (
              <Button type="primary" htmlType="submit" loading={loading}>
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

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Button, Form, Input, Select, DatePicker } from "antd";
import axios from "axios";
import EnrollResultScreen from "./EnrollResultScreen";
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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
  const { role, isLoggedIn } = useSelector((state: RootState) => state.auth);

  const [form] = Form.useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedChildName, setSubmittedChildName] = useState("");
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://sep490-backend-production.up.railway.app/api/survey/1")
      .then((response) => response.json())
      .then((data) => setSurveyData(data.data))
      .catch((error) => console.error("Error fetching survey data:", error));
  }, []);

  const onFinish = async (values: { [key: string]: unknown }) => {
    setLoading(true);
    console.log("Received values of form: ", values);

    const requestBody = {
      surveyId: 1,
      gradeId: 2, // You might want to make this dynamic based on user input
      answers: surveyData?.questions.map((question) => ({
        questionId: question.questionId,
        answerText:
          question.questionType === "text" ? values[question.questionId] : null,
        answerType: question.questionType,
        selectedOptions:
          question.questionType === "choice"
            ? [values[question.questionId]]
            : null,
      })),
      note: values.note || "Đây là thông tin thêm cho khảo sát này.",
    };

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

  if (!surveyData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Sidebar role={role} isLoggedIn={isLoggedIn} />
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
          <h2>{surveyData.surveyTitle}</h2>
          {surveyData.questions.map((question) => (
            <Form.Item
              key={question.questionId}
              name={question.questionId}
              label={question.questionText}
              rules={[
                { required: true, message: `Vui lòng trả lời câu hỏi này!` },
              ]}
            >
              {question.questionType === "text" ? (
                question.questionId === 4 || question.questionId === 7 ? (
                  <DatePicker style={{ width: "100%" }} />
                ) : (
                  <Input />
                )
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
          ))}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default EnrollScreen;

import React, { useEffect, useState } from "react";
import { Descriptions, Button, Flex, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

interface Answer {
  questionId: number;
  questionText: string;
  questionType: string;
  answerText: string | null;
  selectedOptions: string[] | null;
}

interface EnrollmentData {
  registerInforId: number;
  surveyId: number;
  surveyTitle: string;
  nameParent: string;
  answers: Answer[];
  links: string[];
}

const EnrollDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollmentData = async () => {
      try {
        const response = await axios.get(`https://sep490-backend-production.up.railway.app/api/v1/register-infor/${id}`);
        setEnrollmentData(response.data.data);
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        message.error("Failed to load enrollment data");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentData();
  }, [id]);

  const handleButtonClick = (action: string) => {
    // Implement approval/rejection logic here
    console.log(`${action} clicked for enrollment ${id}`);
    navigate("/enroll-list");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!enrollmentData) {
    return <div>No data found</div>;
  }

  const items = enrollmentData.answers.map((answer, index) => ({
    key: index,
    label: answer.questionText,
    children: answer.answerText || answer.selectedOptions?.join(", ") || "N/A",
  }));

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%' }}>
        <Descriptions
          title={`Thông tin đăng ký học: ${enrollmentData.nameParent}`}
          bordered
          items={items}
        />
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Flex gap="small" wrap justify="center">
            <Button type="primary" onClick={() => handleButtonClick("approve")}>Đồng ý</Button>
            <Button danger onClick={() => handleButtonClick("reject")}>Từ chối</Button>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default EnrollDetailScreen;
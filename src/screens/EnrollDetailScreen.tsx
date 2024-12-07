import React, { useEffect, useState } from "react";
import { Button, Flex, message, Modal, Input } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import usePageTitle from "../hooks/usePageTitle";

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
  const location = useLocation();
  const status = location.state?.status;
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { setPageTitle } = usePageTitle();

  const isActionDisabled = status === "APPROVE" || status === "REJECTED";

  useEffect(() => {
    setPageTitle("Thông tin đăng ký học", "#4154f1");
  }, [setPageTitle]);

  useEffect(() => {
    const fetchEnrollmentData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        console.log("Fetching data for id:", id);
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/register-infor/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Received data:", response.data);
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

  const handleButtonClick = async (action: string) => {
    try {
      if (action === "approve") {
        setApprovalLoading(true);
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/register-infor/${id}/approve`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Approval response:", response.data);
        message.success("Đã chấp nhận đơn đăng kí học!");
        navigate("/enroll-list");
      } else if (action === "reject") {
        setIsRejectModalVisible(true);
      }
    } catch (error) {
      console.error(
        `Error ${action === "approve" ? "approving" : "rejecting"} enrollment:`,
        error
      );
      message.error(`Failed to ${action} enrollment`);
    } finally {
      setApprovalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  const handleReject = async () => {
    try {
      setApprovalLoading(true);
      const token = localStorage.getItem("accessToken");
      const encodedReason = encodeURIComponent(rejectionReason);
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/register-infor/${id}/reject?message=${encodedReason}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Rejection response:", response.data);
      message.success("Đã từ chối đơn đăng kí học!");
      setIsRejectModalVisible(false);
      navigate("/enroll-list");
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
      message.error("Failed to reject enrollment");
    } finally {
      setApprovalLoading(false);
    }
  };

  if (!enrollmentData) {
    return (
      <div className="flex justify-center items-center h-screen">
        No data found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        Quay lại
      </Button>
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 text-white">
          <h1 className="text-2xl font-bold">Thông tin đăng ký học giáo lý</h1>
          <p className="text-lg">Người làm đơn: {enrollmentData.nameParent}</p>
        </div>

        <div className="p-6">
          <div className="mb-8 border-b pb-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Thông tin chung
            </h2>
            <p className="text-gray-600">
              <span className="font-medium">ID đăng ký:</span>{" "}
              {enrollmentData.registerInforId}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Tiêu đề khảo sát:</span> Bảng điền
              thông tin phụ huynh và thiếu nhi
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Câu trả lời
            </h2>
            {enrollmentData.answers.map((answer, index) => {
              const answerContent =
                answer.answerText || answer.selectedOptions?.join(", ");

              if (
                answerContent &&
                answerContent.trim() !== "" &&
                answerContent.trim().toLowerCase() !== "null"
              ) {
                return (
                  <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-700">
                      {index + 1}. {answer.questionText}
                    </p>
                    <p className="mt-2 text-gray-600">{answerContent}</p>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {enrollmentData.links && enrollmentData.links.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                Tài liệu đính kèm
              </h2>
              <ul className="list-disc list-inside">
                {enrollmentData.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Tài liệu {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Flex gap="small" wrap justify="center" className="mt-8">
            <Button
              type="primary"
              onClick={() => handleButtonClick("approve")}
              loading={approvalLoading}
              className="px-8 py-2 h-auto"
              disabled={isActionDisabled}
            >
              Đồng ý
            </Button>
            <Button
              danger
              onClick={() => handleButtonClick("reject")}
              className="px-8 py-2 h-auto"
              disabled={isActionDisabled}
            >
              Từ chối
            </Button>
          </Flex>
        </div>
      </div>
      <Modal
        title="Lý do từ chối"
        visible={isRejectModalVisible}
        onOk={handleReject}
        onCancel={() => setIsRejectModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ loading: approvalLoading }}
      >
        <Input.TextArea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>
    </div>
  );
};

export default EnrollDetailScreen;

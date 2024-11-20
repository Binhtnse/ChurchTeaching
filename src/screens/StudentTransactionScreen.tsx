import React, { useEffect, useState } from "react";
import { Form, Button, InputNumber, Card, message, Checkbox, Spin } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";

interface Policy {
  tuitionFee: number;
}

interface FormValues {
  amount: number;
  studentClassId: number;
  churchDonation: boolean;
  donationAmount: number;
}

const StudentTransactionScreen: React.FC = () => {
  const [form] = Form.useForm();
  const { isLoggedIn } = useAuthState();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [churchDonation, setChurchDonation] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);
  console.log(policies);

  const userString = localStorage.getItem("userLogin");
  const studentId = userString ? JSON.parse(userString).id : null;
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingPolicy(true);
      try {
        const policiesRes = await axios.get(
          `https://sep490-backend-production.up.railway.app/api/v1/policy/student/${studentId}`
        );

        form.setFieldsValue({ studentClassId: studentId });
        setPolicies(policiesRes.data.data);
        const policyData = policiesRes.data;
        setPolicies([policyData]);
        setMinAmount(policyData.tuitionFee);
        form.setFieldsValue({ amount: policyData.tuitionFee });
      } catch (error) {
        message.error("Failed to fetch required data");
        console.log(error);
      } finally {
        setIsLoadingPolicy(false);
      }
    };

    fetchData();
  }, [isLoggedIn, studentId, token, form]);

  const handleSubmit = async (values: FormValues) => {
    const totalAmount =
      minAmount + (values.churchDonation ? values.donationAmount : 0);

    const payload = {
      studentClassId: values.studentClassId,
      amount: totalAmount,
      payerId: studentId,
    };

    setLoading(true);
    try {
      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/tuition/pay",
        payload
      );
      const { paymentUrl } = response.data;
      window.location.href = paymentUrl;
    } catch (error) {
      message.error("Transaction failed");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white shadow-md rounded-lg py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <Card className="shadow-2xl rounded-2xl border-0">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
              Đóng học phí
            </h2>
            <p className="text-lg text-gray-600">
              Vui lòng kiểm tra thông tin thanh toán
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-6"
          >
            <Spin spinning={isLoadingPolicy}>
              <Form.Item
                label={
                  <span className="text-base font-medium">Học phí cố định</span>
                }
              >
                <InputNumber
                  className="w-full rounded-lg text-base"
                  size="large"
                  disabled
                  value={minAmount}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>

              <Form.Item name="churchDonation" valuePropName="checked">
                <Checkbox onChange={(e) => setChurchDonation(e.target.checked)}>
                  Tôi muốn đóng góp cho giáo xứ
                </Checkbox>
              </Form.Item>

              {churchDonation && (
                <Form.Item
                  name="donationAmount"
                  label={
                    <span className="text-base font-medium">
                      Số tiền đóng góp
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số tiền đóng góp",
                    },
                    {
                      type: "number",
                      min: 0,
                      message: "Số tiền không được âm",
                    },
                  ]}
                >
                  <InputNumber
                    className="w-full rounded-lg text-base"
                    size="large"
                    placeholder="0.00 VND"
                    onChange={(value: number | null) =>
                      setDonationAmount(value || 0)
                    }
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg mb-8">
                <p className="text-base font-medium text-blue-700">
                  Tổng tiền:{" "}
                  {(
                    minAmount + (churchDonation ? donationAmount : 0)
                  ).toLocaleString()}{" "}
                  VND
                </p>
              </div>

              <Form.Item name="studentClassId" hidden>
                <InputNumber />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg h-14 text-lg font-semibold transition-colors duration-200"
                >
                  {loading ? "Đang xử lý..." : "Thanh toán"}
                </Button>
              </Form.Item>
            </Spin>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default StudentTransactionScreen;

import React, { useEffect, useState } from "react";
import { Form, Button, InputNumber, Card, message } from "antd";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";

interface Policy {
  tuitionFee: number;
}

interface FormValues {
  amount: number;
  studentClassId: number;
}

const StudentTransactionScreen: React.FC = () => {
  const [form] = Form.useForm();
  const { isLoggedIn } = useAuthState();
  const [policies, setPolicies] = useState<Policy[]>([]);
  console.log(policies);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const userString = localStorage.getItem("userLogin");
  const studentId = userString ? JSON.parse(userString).id : null;
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [policiesRes] = await Promise.all([
          axios.get(
            "https://sep490-backend-production.up.railway.app/api/v1/policy"
          ),
        ]);

        form.setFieldsValue({ studentClassId: studentId });
        setPolicies(policiesRes.data.data);
        if (policiesRes.data.length > 0) {
          const tuitionFee = policiesRes.data.data[0].tuitionFee;
          setMinAmount(tuitionFee);
          form.setFieldsValue({ amount: tuitionFee });
        }
      } catch (error) {
        message.error("Failed to fetch required data");
        console.log(error);
      }
    };

    fetchData();
  }, [isLoggedIn, studentId, token, form]);

  const handleSubmit = async (values: FormValues) => {
    const payload = {
      studentClassId: values.studentClassId,
      amount: values.amount,
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
              Vui lòng nhập số tiền bạn muốn đóng
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-6"
          >
            <Form.Item
              name="amount"
              label={<span className="text-base font-medium">Số tiền đóng</span>}
              rules={[
                { required: true, message: "Vui lòng nhập số tiền" },
                {
                  type: "number",
                  min: minAmount,
                  message: `Số tiền đóng không được nhỏ hơn ${minAmount}`,
                },
              ]}
            >
              <InputNumber
                className="w-full rounded-lg text-base"
                size="large"
                min={minAmount}
                placeholder="0.00 VND"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>

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
          </Form>

          {minAmount > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Số tiền tối thiểu cần đóng: {minAmount.toLocaleString()} VND
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentTransactionScreen;

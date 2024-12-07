import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Card,
  message,
  Checkbox,
  Spin,
} from "antd";
import axios from "axios";

const { Option } = Select;

interface Child {
  id: number;
  fullName: string;
}

interface Policy {
  tuitionFee: number;
}

interface FormValues {
  childId: number;
  churchDonation: boolean;
  donationAmount: number;
  studentClassId: number;
}

interface AcademicYear {
  id: number;
  year: string;
  timeStatus: string;
}

const ParentTransactionScreen: React.FC = () => {
  const [form] = Form.useForm();
  const [children, setChildren] = useState<Child[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  console.log(policies)
  const [minAmount, setMinAmount] = useState<number>(0);
  const [churchDonation, setChurchDonation] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    number | null
  >(null);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [donationAmount, setDonationAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);

  const userString = localStorage.getItem("userLogin");
  const parentId = userString ? JSON.parse(userString).id : null;

  const token = localStorage.getItem("accessToken");

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      setAcademicYears(response.data);
      const currentYear = response.data.find(
        (year: AcademicYear) => year.timeStatus === "NOW"
      );
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id);
      }
    } catch (error) {
      console.log(error);
      message.error("Không thể lấy danh sách niên khóa");
    }
  };

  const fetchChildren = async () => {
    try {
      const childrenRes = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/user/${parentId}/students/tuition?yearId=${selectedAcademicYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!childrenRes.data.data || childrenRes.data.data.length === 0) {
        message.info(
          "Không tìm thấy thiếu nhi nào được liên kết với tài khoản"
        );
        setChildren([]);
        return;
      }

      setChildren(childrenRes.data.data);
    } catch (error) {
      message.error("Không thể tải danh sách thiếu nhi. Vui lòng thử lại sau");
      setChildren([]);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchChildren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAcademicYear, parentId, token]);

  const handleChildSelect = async (childId: number) => {
    setIsLoadingPolicy(true);
    try {
      const classResponse = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/class/student/${childId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const studentClassId = classResponse.data.data;

      const policyResponse = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/policy/student/${childId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const policyData = policyResponse.data;
      setPolicies([policyData]);
      setMinAmount(policyData.tuitionFee);
      form.setFieldsValue({
        studentClassId,
        amount: policyData.tuitionFee,
      });
    } catch (error) {
      message.error("Failed to fetch student information");
      console.log(error);
    } finally {
      setIsLoadingPolicy(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    const totalAmount =
      minAmount + (values.churchDonation ? values.donationAmount : 0);

    const payload = {
      studentClassId: values.studentClassId,
      amount: totalAmount,
      payerId: parentId,
    };

    setLoading(true);
    try {
      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/tuition/pay",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { paymentUrl } = response.data;
      window.location.href = paymentUrl;
    } catch (error) {
      message.error("Giao dịch thất bại");
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
              Vui lòng chọn thiếu nhi bạn muốn đóng học phí
            </p>
          </div>

          <Form.Item
            name="academicYear"
            label={<span className="text-base font-medium">Niên khóa</span>}
            rules={[{ required: true, message: "Vui lòng chọn niên khóa" }]}
          >
            <Select
              placeholder="Chọn niên khóa"
              onChange={(value) => setSelectedAcademicYear(value)}
              className="rounded-lg text-base"
              size="large"
            >
              {academicYears.map((year: AcademicYear) => (
                <Option key={year.id} value={year.id}>
                  {year.year}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-6"
          >
            <Form.Item
              name="childId"
              label={
                <span className="text-base font-medium">Chọn thiếu nhi</span>
              }
              rules={[{ required: true, message: "Vui lòng chọn thiếu nhi" }]}
            >
              <Select
                placeholder="Chọn thiếu nhi"
                onChange={handleChildSelect}
                className="rounded-lg text-base"
                size="large"
              >
                {children.map((child) => (
                  <Option key={child.id} value={child.id}>
                    {child.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {form.getFieldValue("childId") && (
              <Spin spinning={isLoadingPolicy}>
                <Form.Item
                  label={
                    <span className="text-base font-medium">
                      Học phí cố định
                    </span>
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
                  <Checkbox
                    onChange={(e) => setChurchDonation(e.target.checked)}
                  >
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
                  <Input />
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
            )}
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ParentTransactionScreen;

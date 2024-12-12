import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";

const AddPolicyScreen: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const validateAbsenceLimit = (_: unknown, value: number) => {
    const absenceWithPermissionLimit = form.getFieldValue('absenceWithPermissionLimit');
    if (value && absenceWithPermissionLimit && value > absenceWithPermissionLimit) {
      return Promise.reject('Số ngày nghỉ không phép phải ít hơn hoặc bằng số ngày nghỉ có phép');
    }
    return Promise.resolve();
  };
  const onFinish = async (values: {
    absenceLimit: number;
    absenceWithPermissionLimit: number;
    tuitionFee: number;
    numberOfMember: number;
  }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/policy",
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Tạo quy định thành công");
      form.resetFields();
      console.log(response);
    } catch (error) {
      message.error("Tạo quy định thất bại");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
        Tạo quy định mới
      </h1>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        className="space-y-6"
      >
        <Form.Item
          name="numberOfMember"
          label={
            <span className="text-lg font-semibold">
              Số thiếu nhi một lớp
            </span>
          }
          rules={[
            {
              required: true,
              message: "Vui lòng nhập số thiếu nhi một lớp",
            },
          ]}
        >
          <Input type="number" className="w-full h-10 text-lg" />
        </Form.Item>
        <Form.Item
          name="absenceLimit"
          label={
            <span className="text-lg font-semibold">
              Số ngày nghỉ không phép tối đa
            </span>
          }
          rules={[
            {
              required: true,
              message: "Vui lòng nhập số ngày nghỉ không phép tối đa",
            },
            {
              validator: validateAbsenceLimit,
            }
          ]}
          dependencies={['absenceWithPermissionLimit']}
        >
          <Input type="number" className="w-full h-10 text-lg" />
        </Form.Item>
        <Form.Item
          name="absenceWithPermissionLimit"
          label={
            <span className="text-lg font-semibold">
              Số ngày nghỉ có phép tối đa
            </span>
          }
          rules={[
            {
              required: true,
              message: "Vui lòng nhập số ngày có không phép tối đa",
            },
          ]}
        >
          <Input type="number" className="w-full h-10 text-lg" />
        </Form.Item>
        <Form.Item
          name="tuitionFee"
          label={<span className="text-lg font-semibold">Học phí (Học phí là không bắt buộc)</span>}
          rules={[{ required: true, message: "Vui lòng nhập học phí" }]}
        >
          <Input type="number" className="w-full h-10 text-lg" />
        </Form.Item>
        <Form.Item>
        <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
            loading={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo quy định'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddPolicyScreen;

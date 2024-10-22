import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const AddPolicyScreen: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: {
    absenceLimit: number;
    absenceWithPermissionLimit: number;
    tuitionFee: number;
  }) => {
    try {
      const response = await axios.post('https://sep490-backend-production.up.railway.app/api/v1/policy', {
        ...values,
        numberOfMember: 3
      });
      message.success('Tạo quy định thành công');
      form.resetFields();
      console.log(response);
    } catch (error) {
      message.error('Failed to create policy');
      console.log(error)
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Tạo quy định mới</h1>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="absenceLimit"
          label="Số ngày nghỉ không phép tối đa"
          rules={[{ required: true, message: 'Vui lòng nhập số ngày nghỉ không phép tối đa' }]}
        >
          <Input type="number" className="w-full" />
        </Form.Item>
        <Form.Item
          name="absenceWithPermissionLimit"
          label="Số ngày nghỉ có phép tối đa"
          rules={[{ required: true, message: 'Vui lòng nhập số ngày có không phép tối đa' }]}
        >
          <Input type="number" className="w-full" />
        </Form.Item>
        <Form.Item
          name="tuitionFee"
          label="Học phí"
          rules={[{ required: true, message: 'Vui lòng nhập học phí' }]}
        >
          <Input type="number" className="w-full" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full bg-blue-500 hover:bg-blue-600">
            Tạo quy định
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddPolicyScreen;

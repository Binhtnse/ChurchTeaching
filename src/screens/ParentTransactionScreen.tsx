import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, InputNumber, Card, message } from 'antd';
import { DollarOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useAuthState } from '../hooks/useAuthState';

const { Option } = Select;

interface Child {
  id: number;
  name: string;
}

interface Student {
  id: number;
  studentClassId: number;
  studentId: number;
}

interface Policy {
  tuitionFee: number;
}

const TransactionPayScreen: React.FC = () => {
  const [form] = Form.useForm();
  const { isLoggedIn} = useAuthState();
  const [children, setChildren] = useState<Child[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const userString = localStorage.getItem("userLogin");
  const parentId = userString ? JSON.parse(userString).id : null;

  useEffect(() => {
    if (!isLoggedIn || !parentId) {
      message.error('Please login to make a payment');
      return;
    }

    const fetchData = async () => {
      try {
        const [childrenRes, studentsRes, policiesRes] = await Promise.all([
          axios.get(`https://sep490-backend-production.up.railway.app/api/v1/user/${parentId}/students`),
          axios.get('https://sep490-backend-production.up.railway.app/api/v1/class/get-students?classId=1'),
          axios.get('https://sep490-backend-production.up.railway.app/api/v1/policy')
        ]);

        setChildren(childrenRes.data.data);
        setStudents(studentsRes.data.data);
        setPolicies(policiesRes.data.data);
        if (policiesRes.data.length > 0) {
          setMinAmount(policiesRes.data.data[0].tuitionFee);
        }
      } catch (error) {
        message.error('Failed to fetch required data');
        console.log(error);
      }
    };

    fetchData();
  }, [isLoggedIn, parentId]);

  console.log(policies);

  const handleChildSelect = (childId: number) => {
    const student = students.find(s => s.studentId === childId);
    if (student) {
      form.setFieldsValue({ studentClassId: student.studentClassId });
    }
  };

  const handleSubmit = async (values: { amount: number; studentClassId: number }) => {
    if (values.amount < minAmount) {
      message.error(`Số tiền đóng không được nhỏ hơn ${minAmount}`);
      return;
    }

    const payload = {
      studentClassId: values.studentClassId,
      amount: values.amount,
      payerId: parentId
    };

    setLoading(true);
    try {
      await axios.post('https://sep490-backend-production.up.railway.app/api/v1/tuition/pay', payload);
      message.success('Transaction completed successfully');
      form.resetFields();
    } catch (error) {
      message.error('Transaction failed');
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Đóng học phí</h2>
            <p className="mt-2 text-gray-600">Vui lòng chọn thiếu nhi bạn muốn đóng học phí</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
          >
            <Form.Item
              name="childId"
              label="Chọn thiếu nhi"
              rules={[{ required: true, message: 'Vui lòng chọn thiếu nhi' }]}
            >
              <Select 
                placeholder="Thiếu nhi"
                onChange={handleChildSelect}
                className="rounded-md"
              >
                {children.map(child => (
                  <Option key={child.id} value={child.id}>{child.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="Số tiền đóng"
              rules={[
                { required: true, message: 'Vui lòng nhập số tiền' },
                { type: 'number', min: minAmount, message: `Số tiền đóng không được nhỏ hơn ${minAmount}` }
              ]}
            >
              <InputNumber
                prefix={<DollarOutlined className="text-gray-400" />}
                className="w-full rounded-md"
                min={minAmount}
                placeholder="0.00"
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>

            <Form.Item name="studentClassId" hidden>
              <Input />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-md h-12 text-lg"
              >
                Thanh toán
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default TransactionPayScreen;

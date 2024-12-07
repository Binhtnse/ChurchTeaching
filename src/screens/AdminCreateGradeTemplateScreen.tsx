import React, { useState } from "react";
import { Form, Input, Button, InputNumber, Space, message, Select } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminCreateGradeTemplateScreen: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    name: string;
    maxExamCount: number;
    exams: Array<{
      name: string;
      weight: number;
      isFullSlot: string;
    }>;
  }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const formattedData = {
        name: values.name,
        maxExamCount: values.maxExamCount,
        exams: values.exams.map((exam, index) => ({
          ...exam,
          orderExam: index + 1,
        })),
      };

      await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/grade-template",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add authorization header
          },
        }
      );

      message.success("Grade template created successfully");
      navigate("/grade-template-list");
    } catch (error) {
      console.log(error);
      message.error("Failed to create grade template");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxExamCountChange = (value: number | null) => {
    if (!value) return;

    const currentExams = form.getFieldValue("exams") || [];
    if (currentExams.length > value) {
      // Remove excess exams
      const newExams = currentExams.slice(0, value);
      form.setFieldValue("exams", newExams);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Tạo khung các bài kiểm tra
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="Tên khung các bài kiểm tra"
          rules={[
            {
              required: true,
              message: "Vui lòng điền tên khung các bài kiểm tra!",
            },
          ]}
        >
          <Input placeholder="Điền tên khung các bài kiểm tra" />
        </Form.Item>

        <Form.Item
          name="maxExamCount"
          label="Số bài kiểm tra"
          rules={[
            { required: true, message: "Vui lòng điền số bài kiểm tra!" },
          ]}
        >
          <InputNumber
            min={1}
            className="w-full"
            onChange={handleMaxExamCountChange}
          />
        </Form.Item>

        <Form.List name="exams">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} className="flex w-full mb-4" align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    label="Tên bài kiểm tra"
                    rules={[
                      { required: true, message: "Thiếu tên bài kiểm tra" },
                    ]}
                  >
                    <Input placeholder="Tên bài kiểm tra" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "weight"]}
                    label="Tỉ trọng"
                    rules={[{ required: true, message: "Thiếu tỉ trọng" }]}
                  >
                    <InputNumber
                      placeholder="Tỉ trọng"
                      min={0}
                      max={1}
                      className="w-32"
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "isFullSlot"]}
                    label="Thời lượng"
                    rules={[
                      { required: true, message: "Vui lòng chọn thời lượng!" },
                    ]}
                  >
                    <Select>
                      <Select.Option value={"true"}>Một buổi</Select.Option>
                      <Select.Option value={"false"}>Nửa buổi</Select.Option>
                    </Select>
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    const maxCount = form.getFieldValue("maxExamCount");
                    const currentExams = form.getFieldValue("exams") || [];
                    if (currentExams.length < maxCount) {
                      add();
                    } else {
                      message.warning("Đã đạt số lượng bài kiểm tra tối đa");
                    }
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm bài kiểm tra
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo khung các bài kiểm tra
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminCreateGradeTemplateScreen;

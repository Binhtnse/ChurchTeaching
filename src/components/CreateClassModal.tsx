import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Form, Input, message } from "antd";
import axios from "axios";
import PaginatedSelect from "./PaginatedSelect";
import SelectYear from "./SelectYear";

interface CreateClassPayload {
  name: string;
  numberOfCatechist: number;
  gradeId: number;
  academicYearId: number;
}

const CreateClassModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload: CreateClassPayload = {
        name: values.className,
        numberOfCatechist: Number(values.numberOfCatechist),
        gradeId: values.gradeId,
        academicYearId: values.academicYear,
      };
      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/class",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        message.success("Class created successfully!");
        form.resetFields(); // Reset the form fields
        setIsModalOpen(false); // Close modal after successful creation
      } else {
        message.error("Failed to create class.");
      }
    } catch (error) {
      console.error("Error creating class:", error);
      message.error("An error occurred while creating the class.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields(); // Reset fields when modal is closed
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
        Thêm lớp
      </Button>
      <Modal
        title="Tạo lớp mới"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        style={{ top: 20 }}
        width={1000}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên lớp"
            name="className"
            rules={[{ required: true, message: "Vui lòng nhập tên lớp!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số lượng giảng viên"
            name="numberOfCatechist"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng giảng viên!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Tên cấp lớp"
            name="gradeId"
            rules={[{ required: true, message: "Vui lòng nhập tên cấp lớp!" }]}
          >
            {/* <Input /> */}
            <PaginatedSelect />
          </Form.Item>
          <Form.Item
            label="Năm học"
            name="academicYear"
            rules={[{ required: true, message: "Vui lòng chọn năm học!" }]}
          >
            <SelectYear />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleOk}
              loading={loading}
              style={{ marginRight: 8 }}
            >
              Tạo
            </Button>
            <Button onClick={handleCancel}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateClassModal;

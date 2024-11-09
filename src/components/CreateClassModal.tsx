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

const modalStyles = {
  content: {
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '800px',
    margin: 'auto'
  },
  header: {
    borderBottom: '1px solid #f0f0f0',
    padding: '16px 24px',
    marginBottom: '24px'
  },
  form: {
    padding: '0 24px'
  },
  formItem: {
    marginBottom: '24px'
  },
  input: {
    height: '40px',
    borderRadius: '6px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #f0f0f0',
    marginTop: '24px'
  },
  button: {
    height: '40px',
    borderRadius: '6px',
    minWidth: '100px'
  }
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
        message.success("Tạo lớp thành công");
        form.resetFields(); // Reset the form fields
        setIsModalOpen(false); // Close modal after successful creation
      } else {
        message.error("Tạo lớp thất bại");
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
        style={{ ...modalStyles.content }}
        width={800}
      >
        <Form layout="vertical" form={form} style={modalStyles.form}>
          <Form.Item
            label="Tên lớp"
            name="className"
            style={modalStyles.formItem}
            rules={[{ required: true, message: "Vui lòng nhập tên lớp!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số lượng giáo lý viên"
            name="numberOfCatechist"
            style={modalStyles.formItem}
            rules={[
              { required: true, message: "Vui lòng nhập số lượng giáo lý viên!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Tên khối"
            name="gradeId"
            style={modalStyles.formItem}
            rules={[{ required: true, message: "Vui lòng nhập tên khối!" }]}
          >
            {/* <Input /> */}
            <PaginatedSelect />
          </Form.Item>
          <Form.Item
            label="Niên khóa"
            name="academicYear"
            style={modalStyles.formItem}
            rules={[{ required: true, message: "Vui lòng chọn niên khóa!" }]}
          >
            <SelectYear />
          </Form.Item>
          <Form.Item>
            <div style={modalStyles.footer}>
              <Button
                type="primary"
                onClick={handleOk}
                loading={loading}
                style={modalStyles.button}
              >
                Tạo
              </Button>
              <Button
                onClick={handleCancel}
                style={modalStyles.button}
              >
                Hủy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateClassModal;

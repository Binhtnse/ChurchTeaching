import { useEffect, useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import {
  Button,
  Modal,
  Spin,
  Form,
  Input,
  Select,
  Table,
  Row,
  Col,
  message,
} from "antd";
import axios from "axios";

interface ClassDetailData {
  classId: number;
  className: string;
  numberOfCatechist: number;
  gradeName: string;
  academicYear: string;
  status: string;
  mainTeachers: {
    id: number;
    name: string;
    account: string;
    isMain: boolean;
  }[];
  assistantTeachers: {
    id: number;
    name: string;
    account: string;
    isMain: boolean;
  }[];
  students: { id: number; name: string; account: string }[];
}

const EditClassModal = ({ classId }: { classId: number }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState<ClassDetailData>();

  useEffect(() => {
    const fetchClassData = async () => {
      if (classId) {
        setLoading(true);
        try {
          const response = await axios.get(
            `https://sep490-backend-production.up.railway.app/api/v1/class/${classId}`
          );
          if (response.data.status === "success") {
            setClassData(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching class data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchClassData();
  }, [classId]); // Gọi lại khi classId thay đổi

  const handleEdit = async () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    // Logic to handle save changes can be added here
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const statusOptions = [
    "ACTIVE",
    "INACTIVE",
    "PENDING",
    "REJECTED",
    "APPROVE",
  ];
  const academicYearOptions = ["2023-2024", "2024-2025"];

  const columns = [
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Account",
      dataIndex: "account",
      key: "account",
    },
  ];
  const activateClass = async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.put(
        `https://sep490-backend-production.up.railway.app/api/v1/class/active/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.status === "success") {
        message.success("Kích hoạt lớp thành công!");

        setClassData((prevData) => {
          if (!prevData) {
            return prevData;
          }

          return {
            ...prevData,
            status: "ACTIVE",
          };
        });
      } else {
        message.error("Kích hoạt lớp thất bại!");
      }
    } catch (error) {
      console.error("Error activating class:", error);
      message.error("Đã xảy ra lỗi khi kích hoạt lớp!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
        Chi tiết
      </Button>
      <Modal
        title="Edit Class"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        style={{ top: 20 }}
        width={1000}
      >
        {loading ? (
          <Spin size="large" />
        ) : (
          classData && (
            <Form layout="vertical">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item label="Class Name">
                    <Input value={classData.className} />
                  </Form.Item>
                  <Form.Item label="Number of Catechists">
                    <Input value={classData.numberOfCatechist} />
                  </Form.Item>
                  <Form.Item label="Grade Name">
                    <Input value={classData.gradeName} />
                  </Form.Item>
                  <Form.Item label="Academic Year">
                    <Select defaultValue={classData.academicYear}>
                      {academicYearOptions.map((year) => (
                        <Select.Option key={year} value={year}>
                          {year}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Status">
                    <Select disabled defaultValue={classData.status}>
                      {statusOptions.map((status) => (
                        <Select.Option key={status} value={status}>
                          {status}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Teachers">
                    <div>
                      <strong>Main Teacher:</strong>{" "}
                      {classData.mainTeachers
                        .filter((teacher) => teacher.isMain)
                        .map((teacher) => teacher.name)
                        .join(", ")}
                    </div>
                    <strong>Assistant Teachers:</strong>{" "}
                    {classData.assistantTeachers.map((teacher) => (
                      <div key={teacher.id}>{teacher.name}</div>
                    ))}
                  </Form.Item>
                  <Form.Item label="Students">
                    <Table
                      dataSource={classData.students}
                      columns={columns}
                      rowKey="id"
                      pagination={false}
                      scroll={{ x: 500, y: 600 }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {classData.status !== "ACTIVE" && (
                <Row>
                  <Col span={24}>
                    <Button type="primary" onClick={activateClass}>
                      Kích hoạt
                    </Button>
                  </Col>
                </Row>
              )}
            </Form>
          )
        )}
      </Modal>
    </>
  );    
};

export default EditClassModal;

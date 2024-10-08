import { useEffect, useState } from "react";
import {
  Button,
  Spin,
  Form,
  Input,
  Select,
  Table,
  Row,
  Col,
  message,
  FormProps,
  InputNumber,
} from "antd";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { RollbackOutlined } from "@ant-design/icons";

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
type FieldType = {
  id?: number;
  name?: string;
  startTime?: Date;
  endTime?: Date;
  gradeId?: number;
  academicYearId?: number;
};
const AdminClassDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { classId } = useParams();
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
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
  }, [classId]);
  useEffect(() => {
    fetchAcademicYears();
  }, []);
  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      console.log("Academic Years Data:", response.data);
      setAcademicYears(response.data);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      message.error("Failed to fetch academic years");
    }
  };
  const statusOptions = [
    "ACTIVE",
    "INACTIVE",
    "PENDING",
    "REJECTED",
    "APPROVE",
  ];

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

  useEffect(() => {
    if (classData) {
      form.setFieldsValue({
        numberOfCatechist: classData.numberOfCatechist,
        id: classId,
        className: classData.className,
        status: classData.status,
        academicYearId: academicYears.find(
          (y) => y.year === classData.academicYear
        )?.id,
        gradeId: classData.gradeName,
      });
    }
  }, [academicYears, classData, classId, form]);
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
    // const payload: FieldType = {
    //   id: classId,
    //   name: values.name,
    //   gradeId: values.gradeId,
    //   academicYearId: values.academicYearId, // Giá trị academicYearId
    // };
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };
  if (loading) {
    return <Spin size="large" />;
  }
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex gap-5">
          <Button
            type="primary"
            icon={<RollbackOutlined />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-blue-600">
            Thông lớp {classData?.className}
          </h1>
        </div>
      </div>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item label="Class Name" name="className">
              <Input />
            </Form.Item>
            <Form.Item label="Number of Catechists" name="numberOfCatechist">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Grade Name" name="gradeId">
              <Input name="gradeId" />
            </Form.Item>
            <Form.Item label="Academic Year" name="academicYearId">
              <Select>
                {academicYears.map((year) => (
                  <Select.Option key={year.id} value={year.id}>
                    {year.year} {year.timeStatus === "NOW" ? "(Hiện tại)" : ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Status" name="status">
              <Select>
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
                <strong>Giáo viên chính:</strong>{" "}
                {classData?.mainTeachers
                  .filter((teacher) => teacher.isMain)
                  .map((teacher) => teacher.name)
                  .join(", ")}
              </div>
              <strong>Giáo viên phụ:</strong>{" "}
              {classData?.assistantTeachers.map((teacher) => (
                <div key={teacher.id}>{teacher.name}</div>
              ))}
            </Form.Item>
            <Form.Item label="Students">
              <Table
                dataSource={classData?.students}
                columns={columns}
                rowKey="id"
                pagination={false}
                scroll={{ x: 500, y: 800 }}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AdminClassDetailScreen;

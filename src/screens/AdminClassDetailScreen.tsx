import { useEffect, useState } from "react";
import {
  Button,
  Spin,
  Form,
  Input,
  Table,
  Row,
  Col,
  message,
  FormProps,
  InputNumber,
  Select,
  Tag,
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex gap-6 items-center">
          <Button
            type="primary"
            icon={<RollbackOutlined />}
            onClick={() => navigate(-1)}
            size="large"
            className="hover:scale-105 transition-transform"
          >
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            Thông tin {classData?.className}
          </h1>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm">
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          className="max-w-7xl mx-auto"
        >
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <div className="bg-gray-50 p-6 rounded-lg">
                <Form.Item label="Tên lớp" name="className">
                  <Input className="rounded-md" />
                </Form.Item>
                <Form.Item label="Số lượng giáo viên" name="numberOfCatechist">
                  <InputNumber style={{ width: "100%" }} className="rounded-md" />
                </Form.Item>
                <Form.Item label="Khối" name="gradeId">
                  <Input name="gradeId" className="rounded-md" />
                </Form.Item>
                <Form.Item label="Niên khóa" name="academicYearId">
                  <Select className="rounded-md">
                    {academicYears.map((year) => (
                      <Select.Option key={year.id} value={year.id}>
                        {year.year}{" "}
                        {year.timeStatus === "NOW" && (
                          <Tag color="blue" className="ml-2">
                            Hiện tại
                          </Tag>
                        )}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Trạng thái" name="status">
                  <Select className="rounded-md">
                    {statusOptions.map((status) => (
                      <Select.Option key={status} value={status}>
                        {status === 'ACTIVE' && 'Đang hoạt động'}
                        {status === 'INACTIVE' && 'Không hoạt động'}
                        {status === 'PENDING' && 'Đang chờ'}
                        {status === 'REJECTED' && 'Từ chối'}
                        {status === 'APPROVE' && 'Chấp nhận'}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

              </div>
            </Col>

            <Col span={12}>
              <div className="bg-gray-50 p-6 rounded-lg">
                <Form.Item label="Giáo viên" className="mb-6">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <strong className="text-blue-600">Giáo viên chính:</strong>
                      <div className="mt-2">
                        {classData?.mainTeachers
                          .filter((teacher) => teacher.isMain)
                          .map((teacher) => teacher.name)
                          .join(", ")}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <strong className="text-blue-600">Giáo viên phụ:</strong>
                      {classData?.assistantTeachers.map((teacher) => (
                        <div key={teacher.id} className="mt-2">{teacher.name}</div>
                      ))}
                    </div>
                  </div>
                </Form.Item>

                <Form.Item label="Thiếu nhi thánh thể">
                  <Table
                    dataSource={classData?.students}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 500, y: 600 }}
                    className="border rounded-lg"
                  />
                </Form.Item>
              </div>
            </Col>

            <Col span={24}>
              <Form.Item className="text-right">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="px-8 hover:scale-105 transition-transform"
                >
                  Cập nhật
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default AdminClassDetailScreen;

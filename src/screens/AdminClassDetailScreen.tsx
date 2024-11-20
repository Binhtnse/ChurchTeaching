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
      title: "Tên thiếu nhi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tên tài khoản",
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
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <div className="flex gap-6 items-center">
          <Button
            type="primary"
            icon={<RollbackOutlined />}
            onClick={() => navigate(-1)}
            size="large"
            className="hover:scale-105 transition-transform bg-blue-600"
          >
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-blue-700 pb-2 border-b-2 border-blue-600">
            Thông tin {classData?.className}
          </h1>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg">
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          className="max-w-7xl mx-auto"
        >
          {/* Form Fields Section */}
          <div className="bg-blue-50 p-8 rounded-xl mb-8 border border-blue-100">
            <Row gutter={[32, 24]}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="text-gray-700 font-semibold">Tên lớp</span>
                  }
                  name="className"
                >
                  <Input className="rounded-lg hover:border-blue-400 focus:border-blue-500" />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-gray-700 font-semibold">
                      Số lượng giáo lý viên
                    </span>
                  }
                  name="numberOfCatechist"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    className="rounded-lg"
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-gray-700 font-semibold">Khối</span>
                  }
                  name="gradeId"
                >
                  <Input className="rounded-lg hover:border-blue-400" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="text-gray-700 font-semibold">
                      Niên khóa
                    </span>
                  }
                  name="academicYearId"
                >
                  <Select className="rounded-lg">
                    {academicYears.map((year) => (
                      <Select.Option key={year.id} value={year.id}>
                        {year.year}
                        {year.timeStatus === "NOW" && (
                          <Tag color="blue" className="ml-2 rounded-full">
                            Hiện tại
                          </Tag>
                        )}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-gray-700 font-semibold">
                      Trạng thái
                    </span>
                  }
                  name="status"
                >
                  <Select className="rounded-lg">
                    {statusOptions.map((status) => (
                      <Select.Option key={status} value={status}>
                        <span
                          className={`${
                            status === "ACTIVE"
                              ? "text-green-600"
                              : status === "INACTIVE"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {status === "ACTIVE" && "Đang hoạt động"}
                          {status === "INACTIVE" && "Không hoạt động"}
                          {status === "PENDING" && "Đang chờ"}
                          {status === "REJECTED" && "Từ chối"}
                          {status === "APPROVE" && "Chấp nhận"}
                        </span>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Teachers and Students Section */}
          <Row gutter={[32, 24]}>
            <Col span={12}>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <h2 className="text-xl font-bold text-blue-700 mb-4">
                  Giáo lý viên
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <strong className="text-blue-700">
                      Giáo lý viên chính:
                    </strong>
                    <div className="mt-2 text-gray-700">
                      {classData?.mainTeachers
                        .filter((teacher) => teacher.isMain)
                        .map((teacher) => teacher.name)
                        .join(", ")}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <strong className="text-blue-700">Giáo lý viên phụ:</strong>
                    {classData?.assistantTeachers.map((teacher) => (
                      <div key={teacher.id} className="mt-2 text-gray-700">
                        {teacher.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>

            <Col span={12}>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <h2 className="text-xl font-bold text-blue-700 mb-4">
                  Danh sách thiếu nhi thánh thể
                </h2>
                <Table
                  dataSource={classData?.students}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 500, y: 400 }}
                  className="border rounded-lg"
                  rowClassName="hover:bg-blue-50"
                />
              </div>
            </Col>
          </Row>

          <div className="mt-8 text-right">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="px-8 h-12 bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200 rounded-lg"
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AdminClassDetailScreen;

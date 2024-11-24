import { useEffect, useState } from "react";
import { Button, Spin, Table, Row, Col, message } from "antd";
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

const AdminClassDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  console.log(academicYears);
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
        {/* Form Fields Section */}
        <div className="bg-blue-50 p-8 rounded-xl mb-8 border border-blue-100">
          <Row gutter={[32, 24]}>
            <Col span={12}>
              <div className="mb-6">
                <div className="text-gray-700 font-semibold mb-2">Tên lớp</div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  {classData?.className}
                </div>
              </div>
              <div className="mb-6">
                <div className="text-gray-700 font-semibold mb-2">
                  Số lượng giáo lý viên
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  {classData?.numberOfCatechist}
                </div>
              </div>
              <div className="mb-6">
                <div className="text-gray-700 font-semibold mb-2">Khối</div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  {classData?.gradeName}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-6">
                <div className="text-gray-700 font-semibold mb-2">
                  Niên khóa
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  {classData?.academicYear}
                </div>
              </div>
              <div className="mb-6">
                <div className="text-gray-700 font-semibold mb-2">
                  Trạng thái
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <span
                    className={`${
                      classData?.status === "ACTIVE"
                        ? "text-green-600"
                        : classData?.status === "INACTIVE"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {classData?.status === "ACTIVE" && "Đang hoạt động"}
                    {classData?.status === "INACTIVE" && "Không hoạt động"}
                    {classData?.status === "PENDING" && "Đang chờ"}
                    {classData?.status === "REJECTED" && "Từ chối"}
                    {classData?.status === "APPROVE" && "Chấp nhận"}
                  </span>
                </div>
              </div>
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
                  <strong className="text-blue-700">Giáo lý viên chính:</strong>
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
      </div>
    </div>
  );
};

export default AdminClassDetailScreen;

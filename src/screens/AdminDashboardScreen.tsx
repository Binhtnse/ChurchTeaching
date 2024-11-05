import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Select, Tag } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatisticsData {
  totalClasses: number;
  classesPerGrade: Record<string, number>;
  totalStudents: number;
  totalParents: number;
  totalCatechists: number;
  totalPassed: number;
  totalFailed: number;
  totalDonations: number;
  totalTuition: number;
  totalRegistrations: number;
}

const AdminDashboardScreen: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  console.log(loading);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      setAcademicYears(response.data);
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  };

  const fetchStatistics = async (yearId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://sep490-backend-production.up.railway.app/api/v1/statistics/academic-year/${yearId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatistics(response.data.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchStatistics(selectedYear);
    }
  }, [selectedYear]);

  const GradeBarChart = ({ data }: { data: Record<string, number> }) => {
    const chartData = {
      labels: Object.keys(data),
      datasets: [
        {
          label: "Số lớp",
          data: Object.values(data),
          backgroundColor: "#1890ff",
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: "Số lớp theo khối",
        },
      },
    };

    return <Bar data={chartData} options={options} />;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
        <div className="grid grid-cols-1 gap-6 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Niên khóa
            </label>
            <Select
              className="w-full"
              placeholder="Chọn niên khóa"
              onChange={setSelectedYear}
              value={selectedYear}
            >
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
          </div>
        </div>
      </Card>

      {statistics ? (
        <>
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng số lớp"
                  value={statistics.totalClasses}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng số học sinh"
                  value={statistics.totalStudents}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng số phụ huynh"
                  value={statistics.totalParents}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng số giáo lý viên"
                  value={statistics.totalCatechists}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={8}>
              <Card className="hover:shadow-lg transition-shadow">
                <Statistic
                  title="Đậu"
                  value={statistics.totalPassed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="hover:shadow-lg transition-shadow">
                <Statistic
                  title="Rớt"
                  value={statistics.totalFailed}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: "#cf1322" }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card className="hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng học phí"
                  value={statistics.totalTuition}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
          </Row>

          <Card className="hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-4">Số lớp theo khối</h3>
            <GradeBarChart data={statistics.classesPerGrade} />
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">
            Không tìm thấy dữ liệu thống kê cho niên khóa đã chọn
          </div>
          <div className="text-gray-500 text-sm mt-2">
            Vui lòng chọn niên khóa để xem thống kê
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardScreen;

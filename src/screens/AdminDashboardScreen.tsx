import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Select, Spin } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { BarChart } from "@mui/x-charts";

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
  const [loading, setLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string }[]
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
    const chartData = Object.entries(data).map(([grade, count]) => ({
      grade,
      count
    }));
  
    return (
      <BarChart
        dataset={chartData}
        xAxis={[{ 
          scaleType: 'band', 
          dataKey: 'grade',
          label: 'Khối',
          tickLabelInterval: () => true,
          labelStyle: {
            fontSize: 12
          },
          tickLabelStyle: {
            fontSize: 11,
            textAnchor: 'middle',
            dominantBaseline: "central"
          },
          position: 'bottom'
        }]}
        series={[{ 
          dataKey: 'count', 
          label: 'Số lớp',
          color: '#1890ff',
          valueFormatter: (value) => `${value}`
        }]}
        height={500}
        width={1300}
        layout="vertical"
        margin={{ left: 250, right: 50, top: 30, bottom: 30 }}
      />
    );
  };    

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen">
      <div className="mb-6">
        <Select
          style={{ width: 200 }}
          placeholder="Chọn niên khóa"
          onChange={setSelectedYear}
          value={selectedYear}
          className="border border-blue-300 rounded-md shadow-sm"
        >
          {academicYears.map((year) => (
            <Select.Option key={year.id} value={year.id}>
              {year.year}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Spin spinning={loading}>
        {statistics && (
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
              {statistics && (
                <GradeBarChart data={statistics.classesPerGrade} />
              )}
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default AdminDashboardScreen;

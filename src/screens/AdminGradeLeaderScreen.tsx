import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Spin,
  TablePaginationConfig,
  message,
  Select,
  Tag,
  Card,
  Button,
  Modal,
  Form,
  Radio,
  Space,
} from "antd";
import axios from "axios";

interface GradeLeaderData {
  id: number;
  catechistId: number;
  catechistName: string;
  gradeName: string;
  isPrimary: string;
  academicYear: string;
  status: string;
}

interface User {
  id: number;
  fullName: string;
}

interface ApiResponse {
  status: string;
  message: string | null;
  timestamp: string;
  pageResponse: {
    currentPage: number;
    totalPage: number;
    pageSize: number;
    nextPage: number | null;
    previousPage: number | null;
    totalElements: number | null;
  };
  data: GradeLeaderData[];
}

const AdminGradeLeaderScreen: React.FC = () => {
  const [gradeLeaders, setGradeLeaders] = useState<GradeLeaderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingGradeLeader, setEditingGradeLeader] =
    useState<GradeLeaderData | null>(null);
  const [editForm] = Form.useForm();
  const [catechists, setCatechists] = useState<{ id: number; name: string }[]>(
    []
  );
  const [addLoading, setAddLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<
    { id: number; year: string; timeStatus: string }[]
  >([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
      );
      setAcademicYears(response.data);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      message.error("Failed to fetch academic years");
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=10",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "success") {
        setGrades(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      message.error("An error occurred while fetching grades");
    }
  };

  const fetchGradeLeaders = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      if (!selectedYear || !selectedGrade) return;
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get<ApiResponse>(
          `https://sep490-backend-production.up.railway.app/api/v1/grade-leader/grade/${selectedGrade}/year/${selectedYear}?page=${page}&size=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.data.status === "success") {
          setGradeLeaders(response.data.data);
          setPagination((prev) => ({
            ...prev,
            total: response.data.pageResponse.totalPage * pageSize,
            current: page,
          }));
        }
      } catch (error) {
        console.error("Error fetching grade leaders:", error);
        message.error("Cannot load grade leaders list");
      } finally {
        setLoading(false);
      }
    },
    [selectedYear, selectedGrade]
  );

  const fetchCatechists = async () => {
    try {
      const response = await axios.get(
        "https://sep490-backend-production.up.railway.app/api/v1/user/list?page=1&size=100&role=CATECHIST",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (response.data.status === "success") {
        setCatechists(
          response.data.data.map((user: User) => ({
            id: user.id,
            name: user.fullName,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching catechists:", error);
      message.error("Failed to fetch catechists");
    }
  };

  useEffect(() => {
    fetchAcademicYears();
    fetchGrades();
    fetchCatechists();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedGrade) {
      fetchGradeLeaders();
    }
  }, [fetchGradeLeaders, selectedYear, selectedGrade]);

  const handleAdd = async (values: {
    catechistId: number;
    isPrimary: string;
  }) => {
    setAddLoading(true);
    try {
      // Check if catechist is already a grade leader in this grade
      const isExistingLeader = gradeLeaders.some(
        (leader) =>
          leader.catechistId === values.catechistId &&
          leader.status === "ACTIVE"
      );

      if (isExistingLeader) {
        message.error("Giáo lý viên này đã là trưởng/phó khối của khối này!");
        return;
      }

      // Check if there's already a PRIMARY grade leader
      if (values.isPrimary === "PRIMARY") {
        const existingPrimary = gradeLeaders.find(
          (leader) =>
            leader.isPrimary === "PRIMARY" && leader.status === "ACTIVE"
        );
        if (existingPrimary) {
          message.error("Khối này đã có trưởng khối!");
          return;
        }
      }

      const response = await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/grade-leader",
        {
          catechistId: values.catechistId,
          gradeId: selectedGrade,
          isPrimary: values.isPrimary,
          academicYearId: selectedYear,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data.status === "success") {
        message.success("Thêm trưởng/phó khối thành công");
        setIsModalVisible(false);
        addForm.resetFields();
        fetchGradeLeaders();
      }
    } catch (error) {
      console.log(error);
      message.error("Không thể thêm trưởng/phó khối");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = (record: GradeLeaderData) => {
    setEditingGradeLeader(record);
    editForm.setFieldsValue({
      isPrimary: record.isPrimary,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: { isPrimary: string }) => {
    setEditLoading(true);
    try {
      if (
        values.isPrimary === "PRIMARY" &&
        editingGradeLeader?.isPrimary !== "PRIMARY"
      ) {
        const existingPrimary = gradeLeaders.find(
          (leader) =>
            leader.isPrimary === "PRIMARY" &&
            leader.status === "ACTIVE" &&
            leader.id !== editingGradeLeader?.id
        );

        if (existingPrimary) {
          message.error("Khối này đã có trưởng khối!");
          return;
        }
      }

      const response = await axios.put(
        "https://sep490-backend-production.up.railway.app/api/v1/grade-leader/update",
        {
          gradeLeaderAcademicYearId: editingGradeLeader?.id,
          isPrimary: values.isPrimary,
          academicYearId: selectedYear,
          gradeId: selectedGrade,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data.status === "success") {
        message.success("Cập nhật thành công");
        setEditModalVisible(false);
        fetchGradeLeaders();
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể cập nhật");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(
        `https://sep490-backend-production.up.railway.app/api/v1/grade-leader/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data.status === "success") {
        message.success("Xóa thành công");
        fetchGradeLeaders();
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể xóa");
    }
  };

  const sortedGradeLeaders = [...gradeLeaders].sort((a, b) => {
    if (a.isPrimary === "PRIMARY" && b.isPrimary !== "PRIMARY") return -1;
    if (a.isPrimary !== "PRIMARY" && b.isPrimary === "PRIMARY") return 1;
    return 0;
  });

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
  };

  const handleGradeChange = (value: number) => {
    setSelectedGrade(value);
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchGradeLeaders(newPagination.current, newPagination.pageSize);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    addForm.resetFields();
  };

  const columns = [
    {
      title: (
        <span className="text-blue-600 font-semibold">Tên giáo lý viên</span>
      ),
      dataIndex: "catechistName",
      key: "catechistName",
    },
    {
      title: <span className="text-blue-600 font-semibold">Khối</span>,
      dataIndex: "gradeName",
      key: "gradeName",
    },
    {
      title: <span className="text-blue-600 font-semibold">Vai trò</span>,
      dataIndex: "isPrimary",
      key: "isPrimary",
      render: (isPrimary: string) => (
        <Tag color={isPrimary === "PRIMARY" ? "green" : "blue"}>
          {isPrimary === "PRIMARY" ? "Trưởng khối" : "Phó khối"}
        </Tag>
      ),
    },
    {
      title: <span className="text-blue-600 font-semibold">Niên khóa</span>,
      dataIndex: "academicYear",
      key: "academicYear",
    },
    {
      title: <span className="text-blue-600 font-semibold">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status === "ACTIVE" ? "Đang hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: <span className="text-blue-600 font-semibold">Thao tác</span>,
      key: "actions",
      render: (record: GradeLeaderData) => (
        <Space>
          <Button
            type="primary"
            onClick={() => handleEdit(record)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Chỉnh sửa
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Danh sách trưởng khối
      </h1>
      <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Niên khóa
            </label>
            <Select
              className="w-full"
              placeholder="Chọn niên khóa"
              onChange={handleYearChange}
              value={selectedYear}
            >
              {academicYears.map((year) => (
                <Select.Option key={year.id} value={year.id}>
                  {year.year}
                  {year.timeStatus === "NOW" && (
                    <Tag color="blue" className="ml-2">
                      Hiện tại
                    </Tag>
                  )}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Khối</label>
            <Select
              className="w-full"
              placeholder="Chọn khối"
              onChange={handleGradeChange}
              value={selectedGrade}
            >
              {grades.map((grade) => (
                <Select.Option key={grade.id} value={grade.id}>
                  {grade.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <div className="mb-4 flex justify-end">
        <Button
          type="primary"
          onClick={showModal}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!selectedGrade || !selectedYear}
        >
          Thêm trưởng/phó khối
        </Button>
      </div>

      <Modal
        title={
          <div className="text-xl font-bold text-blue-600">
            Thêm trưởng/phó khối
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        className="rounded-lg"
      >
        <Form
          form={addForm}
          onFinish={handleAdd}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="catechistId"
            label={<span className="text-base font-medium">Giáo lý viên</span>}
            rules={[{ required: true, message: "Vui lòng chọn giáo lý viên" }]}
          >
            <Select
              placeholder="Chọn giáo lý viên"
              className="w-full"
              size="large"
            >
              {catechists.map((catechist) => (
                <Select.Option key={catechist.id} value={catechist.id}>
                  {catechist.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="isPrimary"
            label={<span className="text-base font-medium">Vai trò</span>}
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Radio.Group className="space-x-8">
              <Radio value="PRIMARY" className="text-base">
                <span className="text-green-600 font-medium">Trưởng khối</span>
              </Radio>
              <Radio value="ASSISTANT" className="text-base">
                <span className="text-blue-600 font-medium">Phó khối</span>
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item className="flex justify-end mb-0 mt-6">
            <Button
              onClick={handleCancel}
              className="mr-4 px-6 h-9 text-base hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={addLoading}
              className="px-6 h-9 text-base bg-blue-600 hover:bg-blue-700"
            >
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="text-xl font-bold text-blue-600">
            Chỉnh sửa trưởng/phó khối
          </div>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
        className="rounded-lg"
      >
        <Form
          form={editForm}
          onFinish={handleEditSubmit}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="isPrimary"
            label={<span className="text-base font-medium">Vai trò</span>}
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Radio.Group className="space-x-8">
              <Radio value="PRIMARY" className="text-base">
                <span className="text-green-600 font-medium">Trưởng khối</span>
              </Radio>
              <Radio value="ASSISTANT" className="text-base">
                <span className="text-blue-600 font-medium">Phó khối</span>
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item className="flex justify-end mb-0 mt-6">
            <Button
              onClick={() => setEditModalVisible(false)}
              className="mr-4 px-6 h-9 text-base hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={editLoading}
              className="px-6 h-9 text-base bg-blue-600 hover:bg-blue-700"
            >
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {selectedYear && selectedGrade ? (
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={sortedGradeLeaders}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            className="mb-4 overflow-x-auto"
            rowClassName="hover:bg-gray-50"
          />
        </Spin>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-semibold">
            Vui lòng chọn niên khóa và khối
          </p>
          <p className="text-sm">
            Chọn niên khóa và khối để xem danh sách trưởng khối
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminGradeLeaderScreen;

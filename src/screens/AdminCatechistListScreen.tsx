import React, { useState, useEffect } from "react";
import {
  message,
  Card,
  Modal,
  Upload,
  Button,
  Table,
  Alert,
  Tag,
  Tabs,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { UploadRequestOption } from "rc-upload/lib/interface";

const { Dragger } = Upload;

interface CatechistData {
  code: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  birthPlace: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  address: string;
  level: string;
  email: string;
}

interface ValidatedCatechistData extends CatechistData {
  error?: string;
}

const AdminCatechistListScreen: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<CatechistData[]>([]);
  console.log(previewData);
  const [importedData, setImportedData] = useState<CatechistData[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validRecords, setValidRecords] = useState<ValidatedCatechistData[]>(
    []
  );
  const [invalidRecords, setInvalidRecords] = useState<
    ValidatedCatechistData[]
  >([]);
  console.log(isUploading);

  const columns = [
    { title: "Mã", dataIndex: "code", key: "code" },
    { title: "Họ tên", dataIndex: "fullName", key: "fullName" },
    { title: "Giới tính", dataIndex: "gender", key: "gender" },
    { title: "Ngày sinh", dataIndex: "dateOfBirth", key: "dateOfBirth" },
    { title: "Nơi sinh", dataIndex: "birthPlace", key: "birthPlace" },
    { title: "Họ tên bố", dataIndex: "fatherName", key: "fatherName" },
    { title: "SĐT bố", dataIndex: "fatherPhone", key: "fatherPhone" },
    { title: "Họ tên mẹ", dataIndex: "motherName", key: "motherName" },
    { title: "SĐT mẹ", dataIndex: "motherPhone", key: "motherPhone" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    { title: "Cấp", dataIndex: "level", key: "level" },
    { title: "Email", dataIndex: "email", key: "email" },
  ];

  const customRequest = (options: UploadRequestOption) => {
    const { file, onSuccess } = options;

    // Check if file is a File object
    if (file instanceof File && file.name.endsWith(".xlsx")) {
      setSelectedFile(file);
      handleFileRead(file);
      onSuccess?.("ok");
    } else {
      message.error("Vui lòng chọn file .xlsx");
    }
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
        blankrows: false,
      });

      const validRecords: ValidatedCatechistData[] = [];
      const invalidRecords: ValidatedCatechistData[] = [];
      const codes = new Set();
      const emails = new Set();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      (jsonData as Record<string, string>[]).forEach((item) => {
        const record: ValidatedCatechistData = {
          code: item.Code?.trim(),
          fullName: item["Full Name"]?.trim(),
          gender: item.Gender?.trim(),
          dateOfBirth: item["Date of Birth"]?.trim(),
          birthPlace: item["Birth Place"]?.trim(),
          fatherName: item["Father Name"]?.trim(),
          fatherPhone: item["Father Phone"]?.trim(),
          motherName: item["Mother Name"]?.trim(),
          motherPhone: item["Mother Phone"]?.trim(),
          address: item.Address?.trim(),
          level: item.Level?.trim(),
          email: item.Email?.trim(),
        };

        const errors: string[] = [];

        // Validate empty cells
        if (Object.values(record).some((value) => !value)) {
          errors.push("Có ô trống");
        }

        // Validate duplicate code
        if (codes.has(record.code)) {
          errors.push("Mã trùng lặp");
        }
        codes.add(record.code);

        // Validate duplicate email
        if (emails.has(record.email)) {
          errors.push("Email trùng lặp");
        }
        emails.add(record.email);

        // Validate date format
        if (!dateRegex.test(record.dateOfBirth)) {
          errors.push("Ngày sinh không đúng định dạng YYYY-MM-DD");
        }

        if (errors.length > 0) {
          record.error = errors.join(", ");
          invalidRecords.push(record);
        } else {
          validRecords.push(record);
        }
      });

      setValidRecords(validRecords);
      setInvalidRecords(invalidRecords);
      setPreviewData(validRecords);
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) {
      message.warning("Vui lòng chọn file để tải lên");
      return;
    }
  
    if (invalidRecords.length > 0) {
      message.error(`Không thể tải lên khi có ${invalidRecords.length} bản ghi không hợp lệ`);
      return;
    }
  
    if (validRecords.length === 0) {
      message.warning("Không có dữ liệu hợp lệ để tải lên");
      return;
    }
  
    setIsUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", selectedFile);
  
      await axios.post(
        "https://sep490-backend-production.up.railway.app/api/v1/import-catechist",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      setImportedData(validRecords);
      message.success(`Tải lên thành công ${validRecords.length} bản ghi`);
      setIsModalVisible(false);
      setSelectedFile(null);
      setPreviewData([]);
      setValidRecords([]);
      setInvalidRecords([]);
    } catch (error) {
      console.log(error);
      message.error("Tải lên thất bại");
    } finally {
      setIsUploading(false);
    }
  };  

  useEffect(() => {
    if (
      importedData &&
      Array.isArray(importedData) &&
      importedData.length > 0
    ) {
      message.success(
        `Nhập thành công thông tin ${importedData.length} giáo lý viên`
      );
    }
  }, [importedData]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Alert
        message={
          <span className="text-lg font-bold text-blue-700">
            Thông tin quan trọng
          </span>
        }
        description={
          <div className="text-base bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            Màn hình này nhằm sắp xếp giáo lý viên vào các lớp giáo lý trong
            khoảng từ tháng 6 đến tháng 9 cùng năm (trước khi năm học bắt đầu)
          </div>
        }
        type="info"
        showIcon
        className="mb-6 border-2 border-blue-200 shadow-lg"
      />
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
        Danh Sách Giáo Lý Viên
      </h1>

      <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
        <div className="flex justify-center p-4">
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Nhập danh sách giáo lý viên
          </Button>
        </div>
      </Card>

      {importedData && importedData.length > 0 && (
        <Card className="mt-6 shadow-lg rounded-xl border border-indigo-100">
          <Table
            dataSource={importedData}
            columns={columns}
            rowKey="code"
            className="w-full bg-white rounded-lg"
            scroll={{ x: true }}
            loading={isUploading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} mục`,
            }}
          />
        </Card>
      )}

      <Modal
        title={
          <h2 className="text-2xl font-semibold">
            Tải lên danh sách giáo lý viên
          </h2>
        }
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
        className="rounded-lg"
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={isUploading}
            disabled={!selectedFile || invalidRecords.length > 0}
            onClick={handleConfirmUpload}
            className="bg-blue-600"
          >
            Xác nhận
          </Button>,
        ]}
      >
        <Dragger
          name="file"
          multiple={false}
          showUploadList={false}
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8"
          customRequest={customRequest}
        >
          <p className="ant-upload-drag-icon text-4xl text-blue-500">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text text-lg font-semibold mt-4">
            Click hoặc kéo file vào đây để tải lên
          </p>
          <p className="ant-upload-hint text-gray-500 mt-2">
            Hỗ trợ tải lên file Excel (.xlsx)
          </p>
        </Dragger>

        {(validRecords.length > 0 || invalidRecords.length > 0) && (
          <div className="mt-8 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-blue-600 px-4 pt-4">
              Xem trước nội dung tải lên
            </h3>
            <Tabs
              defaultActiveKey="1"
              type="card"
              className="mx-4"
              items={[
                {
                  key: "1",
                  label: (
                    <span className="px-2">
                      <Tag color="green">Hợp lệ ({validRecords.length})</Tag>
                    </span>
                  ),
                  children: (
                    <div className="border rounded-b-lg p-4">
                      <Table
                        dataSource={validRecords}
                        columns={columns}
                        pagination={false}
                        scroll={{ x: true, y: 300 }}
                        size="small"
                        className="border rounded-lg"
                      />
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <span className="px-2">
                      <Tag color="red">
                        Không hợp lệ ({invalidRecords.length})
                      </Tag>
                    </span>
                  ),
                  children: (
                    <div className="border rounded-b-lg p-4">
                      <Table
                        dataSource={invalidRecords}
                        columns={[
                          ...columns,
                          { title: "Lỗi", dataIndex: "error", key: "error" },
                        ]}
                        pagination={false}
                        scroll={{ x: true, y: 300 }}
                        size="small"
                        className="border rounded-lg"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
export default AdminCatechistListScreen;

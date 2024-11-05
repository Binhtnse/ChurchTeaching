import React, { useState, useEffect } from "react";
import { message, Card, Modal, Upload, Button, Table } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from 'xlsx';
import { UploadRequestOption } from 'rc-upload/lib/interface';

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
    imageUrl: string;
    address: string;
    level: string;
    email: string;
}

const AdminCatechistListScreen: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewData, setPreviewData] = useState<CatechistData[]>([]);
    const [importedData, setImportedData] = useState<CatechistData[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    console.log(isUploading)

    const columns = [
        { title: 'Mã', dataIndex: 'code', key: 'code' },
        { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
        { title: 'Ngày sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth' },
        { title: 'Nơi sinh', dataIndex: 'birthPlace', key: 'birthPlace' },
        { title: 'Họ tên bố', dataIndex: 'fatherName', key: 'fatherName' },
        { title: 'SĐT bố', dataIndex: 'fatherPhone', key: 'fatherPhone' },
        { title: 'Họ tên mẹ', dataIndex: 'motherName', key: 'motherName' },
        { title: 'SĐT mẹ', dataIndex: 'motherPhone', key: 'motherPhone' },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
        { title: 'Cấp', dataIndex: 'level', key: 'level' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
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

    const handleUploadTemplate = async (file: File) => {
        setIsUploading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const formData = new FormData();
            formData.append("file", file);

            const response = await axios.post(
                "https://sep490-backend-production.up.railway.app/api/v1/import-catechist",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log('Upload Response Data:', response.data);
            message.success("Nhập danh sách giáo lý viên thành công");
            setIsModalVisible(false);
        } catch (error) {
            console.log(error)
            message.error("Nhập danh sách giáo lý viên thất bại");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileRead = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                defval: '',
                raw: false,
                blankrows: false
            });

            // Map the data to match the column order
            const formattedData = (jsonData as Record<string, string>[]).map(item => ({
                code: item.Code,
                fullName: item['Full Name'],
                gender: item.Gender,
                dateOfBirth: item['Date of Birth'],
                birthPlace: item['Birth Place'],
                fatherName: item['Father Name'],
                fatherPhone: item['Father Phone'],
                motherName: item['Mother Name'],
                motherPhone: item['Mother Phone'],
                imageUrl: item['Image URL'],
                address: item.Address,
                level: item.Level,
                email: item.Email
            }));

            setPreviewData(formattedData);
        }; reader.readAsBinaryString(file);
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) {
            message.warning("Vui lòng chọn 1 file");
            return;
        }

        setIsUploading(true);
        try {
            await handleUploadTemplate(selectedFile);
            setImportedData(previewData);
            setIsModalVisible(false);
            setSelectedFile(null);
            setPreviewData([]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        if (importedData && Array.isArray(importedData) && importedData.length > 0) {
            message.success(`Nhập thành công thông tin ${importedData.length} giáo lý viên`);
        }
    }, [importedData]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
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
                            showTotal: (total) => `Tổng ${total} mục`
                        }}
                    />
                </Card>
            )}


            <Modal
                title={<h2 className="text-2xl font-semibold">Tải lên danh sách giáo lý viên</h2>}
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
                        disabled={!selectedFile}
                        onClick={handleConfirmUpload}
                        className="bg-blue-600"
                    >
                        Xác nhận
                    </Button>
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

                {previewData.length > 0 && (
                    <div className="mt-4">
                        <h3>Xem trước nội dung:</h3>
                        <Table
                            dataSource={previewData}
                            columns={columns}
                            pagination={false}
                            scroll={{ x: true, y: 300 }}
                            size="small"
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};
export default AdminCatechistListScreen;

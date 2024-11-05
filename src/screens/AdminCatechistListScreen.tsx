import React, { useState } from "react";
import { message, Card, Modal, Upload, Button, Table } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from 'xlsx';

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
    console.log(isUploading)

    const columns = [
        { title: 'Code', dataIndex: 'code', key: 'code' },
        { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Gender', dataIndex: 'gender', key: 'gender' },
        { title: 'Date of Birth', dataIndex: 'dateOfBirth', key: 'dateOfBirth' },
        { title: 'Birth Place', dataIndex: 'birthPlace', key: 'birthPlace' },
        { title: 'Father Name', dataIndex: 'fatherName', key: 'fatherName' },
        { title: 'Father Phone', dataIndex: 'fatherPhone', key: 'fatherPhone' },
        { title: 'Mother Name', dataIndex: 'motherName', key: 'motherName' },
        { title: 'Mother Phone', dataIndex: 'motherPhone', key: 'motherPhone' },
        { title: 'Address', dataIndex: 'address', key: 'address' },
        { title: 'Level', dataIndex: 'level', key: 'level' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
    ];

    const handleFileRead = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            setPreviewData(jsonData as CatechistData[]);
        };
        reader.readAsBinaryString(file);
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
            message.success("Imported catechists successfully");
            setImportedData(response.data.data);
            setIsModalVisible(false);
        } catch (error) {
            console.log(error)
            message.error("Failed to import catechists");
        } finally {
            setIsUploading(false);
        }
    };

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
                <Table
                    dataSource={importedData}
                    columns={columns}
                    rowKey="code"
                    className="w-full bg-white rounded-lg shadow"
                    scroll={{ x: true }}
                />
            )}


            <Modal
                title={<h2 className="text-2xl font-semibold">Tải lên danh sách giáo lý viên</h2>}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={1000}
                style={{ top: 20 }}
                bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
                className="rounded-lg"
            >
                <Dragger
                    name="file"
                    multiple={false}
                    showUploadList={false}
                    className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8"
                    customRequest={({ file, onSuccess }) => {
                        if (file instanceof File && file.name.endsWith(".xlsx")) {
                            handleFileRead(file);
                            handleUploadTemplate(file);
                            onSuccess?.("ok");
                        } else {
                            message.error("Please upload an .xlsx file");
                        }
                    }}
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
                        <h3>File Preview:</h3>
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

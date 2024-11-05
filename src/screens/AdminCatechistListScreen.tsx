import React, { useState } from "react";
import { message, Card, Modal, Upload, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";

const { Dragger } = Upload;

const AdminCatechistListScreen: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    console.log(isUploading)

    const handleUploadTemplate = async (file: File) => {
        setIsUploading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const formData = new FormData();
            formData.append("file", file);

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

            message.success("Imported catechists successfully");
            setIsModalVisible(false);
        } catch (error) {
            console.error("Error importing catechists:", error);
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

            <Modal
                title={<h2 className="text-2xl font-semibold">Tải lên danh sách giáo lý viên</h2>}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
                className="rounded-lg"
            >
                <Dragger
                    name="file"
                    multiple={false}
                    showUploadList={false}
                    className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8"
                    customRequest={({ file, onSuccess }) => {
                        if (file instanceof File && file.name.endsWith(".xlsx")) {
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
            </Modal>
        </div>
    );
};

export default AdminCatechistListScreen;

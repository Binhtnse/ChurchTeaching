/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  ImportOutlined,
  UploadOutlined,
  FileOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button, Modal, Form, Upload, message } from "antd";
import type { UploadFile, UploadProps } from "antd";

const { Dragger } = Upload;

const ImportFileModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    const formData = new FormData();
    if (fileList.length > 0) {
      formData.append("file", fileList[0] as any);
    }

    setUploading(true);
    fetch(
      "https://sep490-backend-production.up.railway.app/api/v1/class/import",
      {
        method: "POST",
        body: formData,
      }
    )
      .then((res) => res.json())
      .then(() => {
        setFileList([]);
        message.success("Upload successfully.");
      })
      .catch(() => {
        message.error("Upload failed.");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const getFileIcon = (file: UploadFile) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "xls":
      case "xlsx":
        return <FileExcelOutlined style={{ fontSize: 24 }} />;
      case "csv":
        return <FileTextOutlined style={{ fontSize: 24 }} />;
      default:
        return <FileOutlined style={{ fontSize: 24 }} />;
    }
  };

  const props: UploadProps = {
    fileList,
    multiple: false,
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    iconRender: (file) => getFileIcon(file),
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="primary"
        icon={<ImportOutlined />}
        onClick={() => setIsModalOpen(true)}
      >
        Tải lên
      </Button>
      <Modal
        title="Nhập File"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        style={{ top: 20 }}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Chọn file để nhập">
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">
                Kéo và thả file vào đây, hoặc nhấn để chọn file
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ cho các định dạng: .csv, .xls, .xlsx 
              </p>
            </Dragger>
          </Form.Item>
        </Form>
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? "Uploading" : "Start Upload"}
        </Button>
      </Modal>
    </>
  );
};

export default ImportFileModal;

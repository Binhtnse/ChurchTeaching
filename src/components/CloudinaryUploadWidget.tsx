import { useEffect, useRef, useState } from "react";
import { Button, List } from "antd";
import { UploadOutlined } from "@ant-design/icons";

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (
          error: Error | null,
          result: Record<string, unknown> | null
        ) => void
      ) => {
        open: () => void;
      };
    };
  }
}

const CloudinaryUploadWidget = ({
  onUploadSuccess,
  onUploadFailure,
}: {
  onUploadSuccess?: (info: unknown) => void;
  onUploadFailure?: (error: unknown) => void;
}) => {
  const cloudinaryRef = useRef<Window["cloudinary"]>();
  const widgetRef =
    useRef<ReturnType<Window["cloudinary"]["createUploadWidget"]>>();
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ url: string; fileName: string }>
  >([]);

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;

    const handleUploadSuccess = (info: {
        secure_url: string;
        original_filename: string;
      }) => {
        const newFile = { url: info.secure_url, fileName: info.original_filename };
        setUploadedFiles((prev) => [...prev, newFile]);
        if (onUploadSuccess) {
          onUploadSuccess(info);
        }
      };

    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dlhd1ztab",
        uploadPreset: "qtsuml94",
      },
      function (error: Error | null, result: Record<string, unknown> | null) {
        if (!error && result && result.event === "success") {
          console.log("Upload successful:", result.info);
          if (onUploadSuccess) {
            handleUploadSuccess(result.info as { secure_url: string; original_filename: string });
          }
        } else if (error) {
          console.error("Upload error:", error);
          if (onUploadFailure) {
            onUploadFailure(error);
          }
        }
      }
    );
  }, [onUploadSuccess, onUploadFailure]);

  const handleUploadClick = () => {
    if (widgetRef.current && typeof widgetRef.current.open === "function") {
      widgetRef.current.open();
    }
  };

  return (
    <div>
      <Button
        onClick={handleUploadClick}
        type="primary"
        icon={<UploadOutlined />}
        size="large"
        style={{
          backgroundColor: "#1890ff",
          borderColor: "#1890ff",
          color: "#ffffff",
          fontWeight: "bold",
          borderRadius: "4px",
          boxShadow: "0 2px 0 rgba(0, 0, 0, 0.045)",
        }}
      >
        Tải tài liệu lên
      </Button>
      <List
        size="small"
        dataSource={uploadedFiles}
        renderItem={(item) => (
          <List.Item>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.fileName}
            </a>
          </List.Item>
        )}
      />
    </div>
  );
};
export default CloudinaryUploadWidget;

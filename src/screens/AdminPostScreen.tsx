/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, message, Form, Input, Select } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import EditorComponent from "../components/EditorComponent";
import { ColumnsType } from "antd/es/table/interface";
import CloudinaryUploadWidget from "../components/CloudinaryUploadWidget";

const { Search } = Input;

interface PostDTO {
  id: number;
  title: string;
  linkImage: string[];
  content: string;
  customCSS: string;
  categoryId: number;
  userId: number;
  category: Category;
}

interface Category {
  id: number;
  name: string;
}

const pageStyles = {
  container: "h-screen w-full max-w-7xl mx-auto px-4 flex flex-col p-6 bg-white rounded-lg shadow-md",
  header: "bg-white shadow-lg rounded-lg p-4 mb-4", // Reduced padding
  searchContainer: "flex justify-between items-center flex-wrap gap-2", // Reduced gap
  tableWrapper: "flex-1 overflow-auto", // Changed to use flex-1
  buttonPrimary:
    "bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-2", // Reduced padding
  modalContent: "max-h-[80vh] overflow-y-auto",
  formContainer: "space-y-4", // Reduced spacing
  actionButtons: "space-x-2 flex items-center",
};

const loadingStyles = {
  spinner: "animate-spin h-5 w-5 mr-3",
  loadingOverlay:
    "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center",
};

const AdminPostScreen: React.FC = () => {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditorModalVisible, setIsEditorModalVisible] =
    useState<boolean>(false);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const { isLoggedIn, role } = useAuthState();
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<PostDTO | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredPosts, setFilteredPosts] = useState<PostDTO[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [postToDelete, setPostToDelete] = useState<PostDTO | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchText.toLowerCase()) ||
        post.content.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [posts, searchText]);

  useEffect(() => {
    if (isLoggedIn && role === "ADMIN") {
      fetchPosts();
      fetchCategories();
    }
  }, [isLoggedIn, role]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get<PostDTO[]>(
        "https://sep490-backend-production.up.railway.app/api/posts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Không thể tải bài viết ");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get<Category[]>(
        "https://sep490-backend-production.up.railway.app/api/categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories");
    }
  };

  const handleAddPost = () => {
    setIsEditorModalVisible(true);
  };

  const handlePostSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const userLogin = JSON.parse(localStorage.getItem("userLogin") || "{}");
      const postData: PostDTO = {
        ...values,
        content: htmlContent,
        linkImage: [imageUrl], // Assuming an empty array for demonstration; adjust as necessary
        customCSS: "",
        userId: userLogin.id,
        id: 0, // ID will be set by the backend
      };

      const response = await axios.post<PostDTO>(
        "https://sep490-backend-production.up.railway.app/api/posts",
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        message.success("Tạo bài viết thành công");
        // setIsEditorModalVisible(false);
        // fetchPosts();
        // form.resetFields();
        // setHtmlContent("");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      message.error("Tạo bài viết thất bại");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditPost = async (values: any) => {
    if (editingPost) {
      setSubmitLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const userLogin = JSON.parse(localStorage.getItem("userLogin") || "{}");
        const postData: PostDTO = {
          ...values,
          content: htmlContent,
          linkImage: [imageUrl],
          customCSS: editingPost.customCSS,
          userId: userLogin.id,
          id: editingPost.id,
        };
        const response = await axios.put<PostDTO>(
          `https://sep490-backend-production.up.railway.app/api/posts`,
          postData,
          {
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          message.success("Cập nhật bài viết thành công");
          // setIsEditModalVisible(false);
          // fetchPosts();
          // form.resetFields();
          // setHtmlContent("");
          // setEditingPost(null);
          window.location.reload();
        }
      } catch (error) {
        console.error("Error updating post:", error);
        message.error("Cập nhật bài viết thất bại");
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const handleDeletePost = async () => {
    if (postToDelete) {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.delete(
          `https://sep490-backend-production.up.railway.app/api/posts/${postToDelete.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 204) {
          message.success("Xóa bài viết thành công");
          setIsDeleteModalVisible(false);
          setPostToDelete(null);
          await fetchPosts();
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        message.error("Xóa bài viết thất bại");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUploadSuccess = (info: any) => {
    setImageUrl(info.secure_url);
    message.success(`Tải hình ảnh lên thành công: ${info.original_filename}`);
  };

  const handleUploadFailure = (error: unknown) => {
    message.error("Tải hình ảnh lên thất bại");
    console.error("Upload error:", error);
  };

  const columns: ColumnsType<PostDTO> = [
    {
      title: "Tựa Đề",
      dataIndex: "title",
      key: "title",
      width: "25%",
      ellipsis: true,
      render: (text: string) => (
        <div className="truncate py-1" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: "Nội Dung",
      dataIndex: "content",
      key: "content",
      width: "55%",
      ellipsis: true,
      render: (content: string) => (
        <div
          className="line-clamp-2 prose prose-sm max-w-none py-1"
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ maxHeight: "4em" }}
        />
      ),
    },
    {
      title: "Hành Động",
      key: "actions",
      width: "20%",
      render: (_: string, record: PostDTO) => (
        <div className="flex gap-2 py-1">
          <Button
            type="primary"
            onClick={() => {
              setEditingPost(record);
              setIsEditModalVisible(true);
              setHtmlContent(record.content);
              setImageUrl(record.linkImage[0]);
              form.setFieldsValue({
                title: record.title,
                categoryId: record?.category?.id,
              });
            }}
          >
            Chỉnh sửa
          </Button>
          <Button
            onClick={() => {
              setPostToDelete(record);
              setIsDeleteModalVisible(true);
            }}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.header}>
        <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
          Quản Lý Bài Viết
        </h1>
        <div className={pageStyles.searchContainer}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPost}
            className={pageStyles.buttonPrimary}
          >
            Thêm bài viết mới
          </Button>
          <Search
            placeholder="Tìm kiếm bài viết..."
            allowClear
            enterButton
            className="w-full md:w-96"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className={pageStyles.tableWrapper}>
        <Table
          columns={columns}
          dataSource={filteredPosts}
          loading={{
            indicator: (
              <div className={loadingStyles.spinner}>
                <LoadingOutlined />
              </div>
            ),
            spinning: loading,
          }}
          rowKey="id"
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showTotal: (total) => `Tổng số ${total} bài viết`,
          }}
          size="middle" // Use smaller table size
          className="ant-table-compact"
        />
      </div>

      <Modal
        title={
          <span className="text-xl font-semibold">Chỉnh sửa bài viết</span>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingPost(null);
          form.resetFields();
          setHtmlContent("");
        }}
        footer={null}
        width="80%"
        className="top-4"
        bodyStyle={{ maxHeight: "80vh", overflow: "auto" }}
      >
        <Form
          form={form}
          onFinish={handleEditPost}
          layout="vertical"
          className="space-y-6 p-4"
        >
          <Form.Item
            name="title"
            label={<span className="font-medium">Tiêu đề</span>}
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input className="rounded-md" placeholder="Nhập tiêu đề bài viết" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <CloudinaryUploadWidget
              onUploadSuccess={handleUploadSuccess} // Handle successful uploads
              onUploadFailure={(error) =>
                console.error("Upload failed:", error)
              }
            />
            {imageUrl && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item label="Nội dung" required>
            <EditorComponent
              initialContent={htmlContent}
              onChange={(content) => setHtmlContent(content)}
            />
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Button
              type="default"
              onClick={() => {
                setIsEditModalVisible(false);
                setEditingPost(null);
                form.resetFields();
                setHtmlContent("");
                setImageUrl("");
              }}
              className="mr-2"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              className="relative"
            >
              {submitLoading && (
                <div className={loadingStyles.loadingOverlay}>
                  <LoadingOutlined className={loadingStyles.spinner} />
                </div>
              )}
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span className="text-xl font-semibold">Thêm bài viết mới</span>}
        open={isEditorModalVisible}
        onCancel={() => {
          setIsEditorModalVisible(false);
          form.resetFields();
          setHtmlContent("");
        }}
        footer={null}
        width="80%"
        className="top-4"
        bodyStyle={{ maxHeight: "80vh", overflow: "auto" }}
      >
        <Form
          form={form}
          onFinish={handlePostSubmit}
          layout="vertical"
          className="space-y-6 p-4"
        >
          <Form.Item
            name="title"
            label={<span className="font-medium">Tiêu đề</span>}
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input className="rounded-md" placeholder="Nhập tiêu đề bài viết" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Upload Hình ảnh">
            <CloudinaryUploadWidget
              onUploadSuccess={handleUploadSuccess}
              onUploadFailure={handleUploadFailure}
            />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            required
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <EditorComponent
              initialContent={htmlContent}
              onChange={(content) => setHtmlContent(content)}
            />
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Button
              type="default"
              onClick={() => {
                setIsEditorModalVisible(false);
                form.resetFields();
                setHtmlContent("");
              }}
              className="mr-2"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              className="relative"
            >
              {submitLoading && (
                <div className={loadingStyles.loadingOverlay}>
                  <LoadingOutlined className={loadingStyles.spinner} />
                </div>
              )}
              Đăng bài
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <span className="text-xl font-semibold text-red-600">
            Xác nhận xóa
          </span>
        }
        open={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setPostToDelete(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="delete"
            danger
            type="primary"
            onClick={handleDeletePost}
            className="relative"
            loading={loading}
          >
            Xóa
          </Button>,
        ]}
      >
        <div className="py-4">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa bài viết này không?
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Hành động này không thể hoàn tác.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPostScreen;

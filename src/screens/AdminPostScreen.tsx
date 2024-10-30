/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, message, Form, Input, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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

const AdminPostScreen: React.FC = () => {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditorModalVisible, setIsEditorModalVisible] = useState<boolean>(false);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const { isLoggedIn, role } = useAuthState();
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<PostDTO | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredPosts, setFilteredPosts] = useState<PostDTO[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
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
      const response = await axios.get<PostDTO[]>(
        "https://sep490-backend-production.up.railway.app/api/posts"
      );
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get<Category[]>(
        "https://sep490-backend-production.up.railway.app/api/categories"
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
          },
        }
      );
      if (response.status === 200) {
        message.success("Post created successfully");
        // setIsEditorModalVisible(false);
        // fetchPosts();
        // form.resetFields();
        // setHtmlContent("");
        window.location.reload()
      }
    } catch (error) {
      console.error("Error creating post:", error);
      message.error("Failed to create post");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditPost = async (values: any) => {
    if (editingPost) {
      setSubmitLoading(true);
      try {
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
            },
          }
        );
        if (response.status === 200) {
          message.success("Post updated successfully");
          // setIsEditModalVisible(false);
          // fetchPosts();
          // form.resetFields();
          // setHtmlContent("");
          // setEditingPost(null);
          window.location.reload()
        }
      } catch (error) {
        console.error("Error updating post:", error);
        message.error("Failed to update post");
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const handleDeletePost = async () => {
    if (postToDelete) {
      setLoading(true);
      try {
        const response = await axios.delete(
          `https://sep490-backend-production.up.railway.app/api/posts/${postToDelete.id}`
        );
        if (response.status === 200) {
          message.success("Post deleted successfully");
          // setIsDeleteModalVisible(false);
          // setPostToDelete(null);
          window.location.reload()
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        message.error("Failed to delete post");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUploadSuccess = (info: any) => {
    setImageUrl(info.secure_url);
    message.success(`Image uploaded successfully: ${info.original_filename}`);
  };

  const handleUploadFailure = (error: unknown) => {
    message.error("Failed to upload image");
    console.error("Upload error:", error);
  };

  const columns: ColumnsType<PostDTO> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (content: string) => (
        <div
          className="line-clamp-2 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ maxHeight: "3em", WebkitLineClamp: 2 }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: string, record: PostDTO) => (
        <div>
          <Button
            type="primary"
            onClick={() => {
              setEditingPost(record);
              setIsEditModalVisible(true);
              setHtmlContent(record.content);
              setImageUrl(record.linkImage[0])
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
            className="ml-2"
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddPost}
          className="mb-4"
        >
          Add New Post
        </Button>
        <Search
          placeholder="Tìm kiếm bài viết..."
          allowClear
          enterButton
          className="mb-4 max-w-md"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredPosts}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title="Chỉnh sửa bài viết"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingPost(null);
          form.resetFields();
          setHtmlContent("");
        }}
        footer={null}
        width="80%"
        style={{
          top: 20,
          maxWidth: 1200,
        }}
      >
        <Form
          form={form}
          onFinish={handleEditPost}
          layout="vertical"
          className="p-4"
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề bài viết" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id} >
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <CloudinaryUploadWidget
              onUploadSuccess={handleUploadSuccess} // Handle successful uploads
              onUploadFailure={(error) => console.error("Upload failed:", error)}
            />
            {imageUrl && (
              <div style={{ marginTop: 10 }}>
                <img src={imageUrl} alt="Uploaded" style={{ maxWidth: "100%", height: "auto" }} />
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
            <Button type="primary" htmlType="submit" loading={submitLoading}>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm bài viết mới"
        open={isEditorModalVisible}
        onCancel={() => {
          setIsEditorModalVisible(false);
          form.resetFields();
          setHtmlContent("");
        }}
        footer={null}
        width="80%"
        style={{
          top: 20,
          maxWidth: 1200,
        }}
      >
        <Form
          form={form}
          onFinish={handlePostSubmit}
          layout="vertical"
          className="p-4"
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề bài viết" />
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

          {/* <Form.Item>
            <Button type="primary" htmlType="submit" disabled={!imageUrl}>
              Lưu
            </Button>
          </Form.Item> */}

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
            <Button type="primary" htmlType="submit" loading={submitLoading}>
              Đăng bài
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xóa bài viết"
        open={isDeleteModalVisible}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setPostToDelete(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="delete" onClick={handleDeletePost}>
            Xóa
          </Button>,
        ]}
      >
        <p>Bạn có chắc chắn muốn xóa bài viết này không?</p>
      </Modal>
    </div>
  );
};

export default AdminPostScreen;

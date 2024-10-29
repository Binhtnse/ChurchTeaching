/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, message, Form, Input, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAuthState } from "../hooks/useAuthState";
import EditorComponent from "../components/EditorComponent";
import { ColumnsType } from "antd/es/table/interface";

const { Search } = Input;
interface Post {
  id: number;
  title: string;
  linkImage: string;
  content: string;
  customCSS: string;
  categoryId: number;
  user: User; 
}
interface User {
  fullName: string;
}

interface Category {
  id: number;
  name: string;
}

const AdminPostScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditorModalVisible, setIsEditorModalVisible] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const { isLoggedIn, role } = useAuthState();
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  // Add this function after other function declarations
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
      const response = await axios.get(
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
      const response = await axios.get(
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
      const postData = {
        ...values,
        content: htmlContent,
        linkImage: "",
        customCSS: "",
        userId: userLogin.id,
      };
      const response = await axios.post(
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
        setIsEditorModalVisible(false);
        fetchPosts();
        form.resetFields();
        setHtmlContent("");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      message.error("Failed to create post");
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: ColumnsType<Post> = [
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
      title: "Create By",
      dataIndex: "user",
      key: "user",
      render: (_: any, record: Post) => record.user.fullName,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: string, record: Post) => (
        <Button
          type="primary"
          onClick={() => {
            setEditingPost(record);
            setIsEditModalVisible(true);
            setHtmlContent(record.content);
            form.setFieldsValue({
              title: record.title,
              categoryId: record.categoryId,
            });
          }}
        >
          Chỉnh sửa
        </Button>
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
          onFinish={async (values) => {
            try {
              const userLogin = JSON.parse(
                localStorage.getItem("userLogin") || "{}"
              );
              const postData = {
                ...values,
                content: htmlContent,
                linkImage: editingPost?.linkImage || "",
                customCSS: editingPost?.customCSS || "",
                userId: userLogin.id,
              };

              const response = await axios.put(
                `https://sep490-backend-production.up.railway.app/api/posts/${editingPost?.id}`,
                postData
              );

              if (response.status === 200) {
                message.success("Cập nhật bài viết thành công");
                setIsEditModalVisible(false);
                fetchPosts();
                form.resetFields();
                setHtmlContent("");
                setEditingPost(null);
              }
            } catch (error) {
              message.error("Cập nhật bài viết thất bại");
            }
          }}
          layout="vertical"
          className="p-4"
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select>
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
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
              }}
              className="mr-2"
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
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
    </div>
  );
};

export default AdminPostScreen;

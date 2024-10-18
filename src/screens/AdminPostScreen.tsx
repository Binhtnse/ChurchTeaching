// import React, { useState, useEffect } from "react";
// import { Table, Button, Modal, message, Form, Input, Select } from "antd";
// import { PlusOutlined } from "@ant-design/icons";
// import axios from "axios";
// import { useAuthState } from "../hooks/useAuthState";
// import EditorComponent from "../components/EditorComponent";

// interface Post {
//   id: number;
//   title: string;
//   linkImage: string;
//   content: string;
//   customCSS: string;
//   categoryId: number;
// }

// interface Category {
//   id: number;
//   name: string;
// }

// const AdminPostScreen: React.FC = () => {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isEditorModalVisible, setIsEditorModalVisible] = useState(false);
//   const [htmlContent, setHtmlContent] = useState("");
//   const { isLoggedIn, role } = useAuthState();
//   const [form] = Form.useForm();

//   useEffect(() => {
//     if (isLoggedIn && role === "ADMIN") {
//       fetchPosts();
//       fetchCategories();
//     }
//   }, [isLoggedIn, role]);

//   const fetchPosts = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "https://sep490-backend-production.up.railway.app/api/posts"
//       );
//       setPosts(response.data);
//     } catch (error) {
//       console.error("Error fetching posts:", error);
//       message.error("Failed to fetch posts");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get(
//         "https://sep490-backend-production.up.railway.app/api/categories"
//       );
//       setCategories(response.data);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       message.error("Failed to fetch categories");
//     }
//   };

//   const handleAddPost = () => {
//     setIsEditorModalVisible(true);
//   };

//   const handlePostSubmit = async (values: any) => {
//     try {
//       const postData = {
//         ...values,
//         content: htmlContent,
//         linkImage: "",
//         customCSS: "", // Add custom CSS if needed
//       };
//       const response = await axios.post(
//         "https://sep490-backend-production.up.railway.app/api/posts",
//         postData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             accept: "*/*",
//           },
//         }
//       );
//       if (response.status === 200) {
//         message.success("Post created successfully");
//         setIsEditorModalVisible(false);
//         fetchPosts();
//         form.resetFields();
//         setHtmlContent("");
//       }
//     } catch (error) {
//       console.error("Error creating post:", error);
//       message.error("Failed to create post");
//     }
//   };

//   const columns = [
//     {
//       title: "Title",
//       dataIndex: "title",
//       key: "title",
//     },
//     {
//       title: "Category",
//       dataIndex: "categoryId",
//       key: "categoryId",
//       render: (categoryId: number) => {
//         const category = categories.find((c) => c.id === categoryId);
//         return category ? category.name : "Unknown";
//       },
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (text: string, record: Post) => (
//         <Button onClick={() => handleEditPost(record)}>Edit</Button>
//       ),
//     },
//   ];

//   const handleEditPost = (post: Post) => {
//     // Implement edit functionality
//     console.log("Editing post:", post);
//   };

//   return (
//     <div className="p-6">
//       <Button
//         type="primary"
//         icon={<PlusOutlined />}
//         onClick={handleAddPost}
//         className="mb-4"
//       >
//         Add New Post
//       </Button>
//       <Table
//         columns={columns}
//         dataSource={posts}
//         loading={loading}
//         rowKey="id"
//       />
//       <Modal
//         style={{ top: 20 }}
//         width={1000}
//         title="Add New Post"
//         open={isEditorModalVisible}
//         onCancel={() => setIsEditorModalVisible(false)}
//         footer={null}
//       >
//         <Form form={form} onFinish={handlePostSubmit} layout="vertical">
//           <Form.Item name="title" label="Title" rules={[{ required: true }]}>
//             <Input />
//           </Form.Item>

//           <Form.Item
//             name="categoryId"
//             label="Category"
//             rules={[{ required: true }]}
//           >
//             <Select>
//               {categories.map((category) => (
//                 <Select.Option key={category.id} value={category.id}>
//                   {category.name}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
//           <Form.Item label="Content" rules={[{ required: true }]}>
//             <EditorComponent
//               initialContent={htmlContent}
//               onChange={(content) => setHtmlContent(content)}
//             />
//           </Form.Item>
//           <Form.Item>
//             <Button type="primary" htmlType="submit">
//               Submit
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default AdminPostScreen;

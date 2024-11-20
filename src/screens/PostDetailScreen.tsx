/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Alert, Card, Spin } from "antd";
import axios from "axios";
import { useParams } from "react-router-dom";

interface PostDTO {
  id: number;
  title: string;
  linkImage: any;
  content: string;
  customCSS: string;
  categoryId: number;
  userId: number;
  user: {
    id: number;
    fullName: string;
  };
  category: any;
  createdDate: string; // Add createdDate field
  author: string; // Add author field
}

export const PostDetail: React.FC = () => {
  const [post, setPost] = useState<PostDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get<PostDTO>(`https://sep490-backend-production.up.railway.app/api/posts/${id}`);
      const postData = response.data;

      setPost({
        id: postData.id,
        title: postData.title,
        linkImage: postData.linkImage[0],
        content: postData.content,
        customCSS: postData.customCSS,
        categoryId: postData.category.id,
        userId: postData.user.id,
        user: postData.user, // Include user field
        category: postData.category,
        createdDate: postData.createdDate, // Set createdDate field
        author: postData.user.fullName // Set author field
      });
    } catch (err) {
      setError("Failed to load post details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: "block", margin: "20px auto" }} />;
  if (error) return <Alert message={error} type="error" showIcon style={{ textAlign: "center" }} />;

  return (
    <div style={{ minHeight: "100vh", width: "70%", margin: "0 auto", padding: "32px 0" }}>
      {post ? (
        <Card style={{ width: "100%", textAlign: "center" }}>
          <h1 className="my-5">{post.title}</h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img src={post.linkImage} alt={post.title} style={{ width: "300px", height: "300px" }} />
          </div>
          <p>By {post.author} on {new Date(post.createdDate).toLocaleDateString('en-GB')}</p> {/* Display author and date */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} style={{ marginTop: "16px" }} />
        </Card>
      ) : null}
    </div>
  );
};

export default PostDetail;
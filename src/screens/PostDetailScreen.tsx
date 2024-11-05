/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { Alert, Card, Spin, Layout, Menu, Button, Row, Col } from "antd";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FacebookOutlined, YoutubeOutlined, InstagramOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Footer, Content } = Layout;

interface PostDTO {
  id: number;
  title: string;
  linkImage: any;
  content: string;
  customCSS: string;
  categoryId: number;
  userId: number;
  category: any;
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
        userId: postData.userId,
        category: postData.category
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
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header style={{ backgroundColor: '#3273DC', color: '#fff', padding: '10px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
          NHÀ THỜ THIÊN CHÚA GIÁO
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <FacebookOutlined style={{ color: '#fff', fontSize: '20px' }} />
          <YoutubeOutlined style={{ color: '#fff', fontSize: '20px' }} />
          <InstagramOutlined style={{ color: '#fff', fontSize: '20px' }} />
          <UserOutlined style={{ color: '#fff', fontSize: '20px' }} />
        </div>
      </Header>

      <Header style={{ backgroundColor: '#FFFFFF', padding: '0 50px', borderBottom: '1px solid #e8e8e8' }}>
        <Menu mode="horizontal" style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', borderBottom: 'none', width: '100%' }}>
          <Menu.Item key="home" style={{ flex: 1, textAlign: 'center' }} onClick={() => (window.location.href = '/')}>
            Trang Chủ
          </Menu.Item>
          <Menu.Item key="documents" style={{ flex: 1, textAlign: 'center' }}>Tư Liệu</Menu.Item>
          <Menu.Item key="policy" style={{ flex: 1, textAlign: 'center' }}>Chính Sách</Menu.Item>
          <Menu.Item key="register" style={{ flex: 1, textAlign: 'center' }} onClick={() => (window.location.href = '/enroll')}>
            Đăng Kí Học
          </Menu.Item>
          <Menu.Item key="login" style={{ flex: 1, textAlign: 'center' }}>
            <Button type="link" onClick={() => (window.location.href = '/login')} style={{ fontWeight: 'bold', fontSize: '16px', padding: 0 }}>
              Đăng Nhập
            </Button>
          </Menu.Item>
        </Menu>
      </Header>

      {/* Content */}
      <Content style={{ width: "70%", margin: "0 auto", padding: "32px 0" }}>
        {post ? (
          <Card style={{ width: "100%", textAlign: "center" }}>
            <h1 className="my-5">{post.title}</h1>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img src={post.linkImage} alt={post.title} style={{ width: "300px", height: "300px" }} />
            </div>
            <div dangerouslySetInnerHTML={{ __html: post.content }} style={{ marginTop: "16px" }} />
          </Card>
        ) : null}
      </Content>

      {/* Footer */}
      <Footer style={{ backgroundColor: '#f5f5f5', padding: '40px 0', borderTop: '1px solid #e0e0e0' }}>
        <Row justify="center" gutter={16} style={{ textAlign: 'center', color: '#333', paddingBottom: '20px' }}>
          <Col span={6} style={{ textAlign: 'center' }}>
            <img src="https://via.placeholder.com/80" alt="Logo" style={{ marginBottom: '10px' }} />
            <h3>NHÀ THỜ THIÊN CHÚA GIÁO</h3>
          </Col>
          <Col span={6}>
            <h3>Liên Hệ</h3>
            <p>1234 Đường số 6, Phường 1, Quận Tân Bình, TP. Hồ Chí Minh.</p>
            <p>+84 (777) 123 456</p>
            <p>contact@example.com</p>
          </Col>
          <Col span={6}>
            <h3>Mạng Xã Hội</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <FacebookOutlined style={{ fontSize: '20px', color: '#3b5998' }} />
              <YoutubeOutlined style={{ fontSize: '20px', color: '#ff0000' }} />
              <InstagramOutlined style={{ fontSize: '20px', color: '#bc2a8d' }} />
            </div>
          </Col>
        </Row>
        <div style={{ backgroundColor: '#333', color: '#fff', padding: '10px 0', textAlign: 'center' }}>
          ©2024 - nhathothienchuagia.net. All rights reserved. Sài Gòn - Giữ bản quyền.
        </div>
      </Footer>
    </Layout>
  );
};

export default PostDetail;
